<?php

namespace App\Services;

use App\Services\Support\GeminiResult;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Abstraction layer between PKLConnect and the Google Gemini API.
 *
 * Responsibilities:
 *  - send system instruction + conversation contents to Gemini
 *  - normalize the API response into plain text
 *  - survive transient upstream failures: retries + automatic fallback
 *    across several model candidates (separate quota pools)
 *  - handle network/HTTP errors with safe logging (never leaks the API key)
 *  - enforce timeouts
 *
 * No business/AI logic lives here — context building happens in
 * AIContextBuilder and AIMonitoringService.
 */
class GeminiService
{
    /** Ordered candidates tried when the primary model is unavailable.
     * Lite variants respond in ~1s; the full 3.5 model is the quality fallback. */
    protected const FALLBACK_MODELS = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
    ];

    protected const CACHE_HEALTHY = 'gemini.healthy_model';

    protected const CACHE_THROTTLED_PREFIX = 'gemini.throttled.';

    protected const CACHE_NO_THINKING_PREFIX = 'gemini.no_thinking.';

    public function __construct(
        protected string $apiKey,
        protected string $model,
        protected string $baseUrl,
        protected int $timeout = 30,
        protected array $fallbackModels = [],
    ) {}

    public static function make(): static
    {
        $configured = (array) config('services.gemini.fallback_models', self::FALLBACK_MODELS);

        return new static(
            apiKey: (string) config('services.gemini.api_key'),
            model: (string) config('services.gemini.model', 'gemini-2.5-flash'),
            baseUrl: (string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'),
            timeout: (int) config('services.gemini.timeout', 30),
            fallbackModels: array_values(array_diff($configured, [(string) config('services.gemini.model')])),
        );
    }

    public function isConfigured(): bool
    {
        return $this->apiKey !== '';
    }

    /**
     * @param  array<int, array{role: string, text: string}>  $contents  role: "user"|"model"
     */
    public function chat(string $systemInstruction, array $contents): GeminiResult
    {
        if (! $this->isConfigured()) {
            return GeminiResult::failure('AI belum dikonfigurasi di server (API key tidak ditemukan).');
        }

        foreach ($this->buildCandidates() as $index => $model) {
            // Small pause before falling over to the next candidate so we
            // do not hammer the API during a rate-limit window.
            if ($index > 0) {
                usleep(600_000);
            }

            $result = $this->callModel($model, $systemInstruction, $contents);

            if ($result->ok) {
                // Remember the working model so later calls skip dead ones.
                Cache::put(self::CACHE_HEALTHY, $model, now()->addMinutes(5));
                Cache::forget(self::CACHE_THROTTLED_PREFIX . $model);

                return $result;
            }

            // Transient problems worth retrying with another model
            // (each candidate model has its own quota bucket).
            $transient = $result->status === 429
                || $result->status === null
                || in_array($result->status, [500, 503], true);

            if (! $transient) {
                return $result; // hard failure — switching models will not help
            }

            if ($result->status === 429) {
                // Skip this model for the next minute (quota exhausted).
                Cache::put(self::CACHE_THROTTLED_PREFIX . $model, true, now()->addMinute());
            } elseif ($result->status === null) {
                // Hanging/unreachable upstream — also skip for a while.
                Cache::put(self::CACHE_THROTTLED_PREFIX . $model, true, now()->addMinutes(2));
            }

            $lastError = $result;
        }

        Log::warning('Gemini exhausted all model candidates', ['primary' => $this->model]);

        return $lastError ?? GeminiResult::failure('NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.');
    }

    /**
     * Candidate order: last-known-healthy model first, then the primary,
     * then fallbacks — skipping anything currently marked as throttled.
     *
     * @return list<string>
     */
    protected function buildCandidates(): array
    {
        $all = array_values(array_unique(array_merge(
            [$this->model],
            $this->fallbackModels,
        )));

        $throttled = collect($all)
            ->filter(fn ($m) => Cache::has(self::CACHE_THROTTLED_PREFIX . $m));

        $healthy = Cache::get(self::CACHE_HEALTHY);

        $ordered = collect($all)
            ->reject(fn ($m) => $throttled->contains($m))
            ->sort(function ($a, $b) use ($healthy) {
                $rank = fn ($m) => ($m === $healthy ? 0 : 10) + ($m === $this->model ? 0 : 1);

                return $rank($a) <=> $rank($b);
            })
            ->values()
            ->all();

        // Never leave ourselves without any candidate.
        return empty($ordered) ? [$this->model] : $ordered;
    }

    /**
     * Single call against one model. Thinking is disabled when supported
     * (faster + fewer tokens); models that reject the directive are
     * remembered and called without it from then on.
     */
    protected function callModel(string $model, string $systemInstruction, array $contents): GeminiResult
    {
        $useThinking = ! Cache::has(self::CACHE_NO_THINKING_PREFIX . $model);

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]],
            ],
            'contents' => collect($contents)
                ->map(fn (array $c) => [
                    'role' => $c['role'] === 'model' ? 'model' : 'user',
                    'parts' => [['text' => (string) $c['text']]],
                ])
                ->values()
                ->all(),
            'generationConfig' => array_filter([
                'temperature' => 0.4,
                'maxOutputTokens' => 1200,
                // Flash models think by default; disable for latency & quota.
                'thinkingConfig' => $useThinking ? ['thinkingBudget' => 0] : null,
            ]),
        ];

        $url = sprintf('%s/models/%s:generateContent', rtrim($this->baseUrl, '/'), $model);

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->connectTimeout(10)
                ->post($url, $payload);
        } catch (ConnectionException $e) {
            Log::error('Gemini connection failed', ['model' => $model, 'reason' => $e->getMessage()]);

            return GeminiResult::failure('Tidak dapat menghubungi layanan AI. Periksa koneksi server.');
        } catch (Throwable $e) {
            Log::error('Gemini unexpected transport error', ['model' => $model, 'reason' => $e->getMessage()]);

            return GeminiResult::failure('Terjadi kesalahan tak terduga saat menghubungi layanan AI.');
        }

        if ($response->status() === 429) {
            Log::warning('Gemini rate limited by upstream', ['model' => $model]);

            return GeminiResult::failure('Layanan AI sedang sibuk. Silakan coba beberapa saat lagi.', 429);
        }

        if ($response->status() === 401 || $response->status() === 403) {
            Log::error('Gemini rejected credentials', ['status' => $response->status()]);

            return GeminiResult::failure('Kredensial AI tidak valid. Hubungi administrator sistem.', $response->status());
        }

        if ($response->failed()) {
            Log::error('Gemini HTTP error', [
                'model' => $model,
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 300),
            ]);

            // Some models reject certain generationConfig fields without naming
            // them ("Request contains an invalid argument."). If we sent the
            // thinking directive, remember the incompatibility and retry this
            // model once without it before treating the failure as final.
            if ($response->status() === 400 && $useThinking) {
                Cache::put(self::CACHE_NO_THINKING_PREFIX . $model, true, now()->addDay());

                return $this->callModelWithoutThinking($model, $systemInstruction, $contents);
            }

            return GeminiResult::failure('NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.', $response->status());
        }

        $data = $response->json();

        // Request may be blocked by safety filters before any candidate exists.
        $blockReason = data_get($data, 'promptFeedback.blockReason');
        if (! empty($blockReason)) {
            Log::warning('Gemini blocked prompt', ['block_reason' => $blockReason]);

            return GeminiResult::failure('Permintaan Anda diblokir oleh filter keamanan AI. Coba rumuskan ulang pertanyaannya.');
        }

        $text = collect(data_get($data, 'candidates.0.content.parts', []))
            ->pluck('text')
            ->filter()
            ->implode("\n");

        if (trim($text) === '') {
            $finishReason = data_get($data, 'candidates.0.finishReason', 'UNKNOWN');
            Log::warning('Gemini returned empty content', ['finish_reason' => $finishReason]);

            return GeminiResult::failure('NEXA tidak menghasilkan jawaban untuk pertanyaan ini. Coba ubah pertanyaannya.');
        }

        return GeminiResult::success(trim($text));
    }

    protected function callModelWithoutThinking(string $model, string $systemInstruction, array $contents): GeminiResult
    {
        // Temporarily neutralize thinkingConfig and re-issue the request.
        $original = $this->baseUrl;

        try {
            $url = sprintf('%s/models/%s:generateContent', rtrim($original, '/'), $model);

            $payload = [
                'system_instruction' => ['parts' => [['text' => $systemInstruction]]],
                'contents' => collect($contents)->map(fn ($c) => [
                    'role' => $c['role'] === 'model' ? 'model' : 'user',
                    'parts' => [['text' => (string) $c['text']]],
                ])->values()->all(),
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 1200,
                ],
            ];

            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->connectTimeout(10)
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $text = collect(data_get($data, 'candidates.0.content.parts', []))
                    ->pluck('text')->filter()->implode("\n");

                if (trim($text) !== '') {
                    return GeminiResult::success(trim($text));
                }
            }

            return GeminiResult::failure(
                'NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.',
                $response->status(),
            );
        } catch (Throwable $e) {
            Log::error('Gemini retry without thinking failed', ['model' => $model]);

            return GeminiResult::failure('NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.');
        }
    }
}
