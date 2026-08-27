<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Services\AIContextBuilder;
use App\Services\AIMonitoringService;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AIController extends Controller
{
    protected const MAX_MESSAGE_LENGTH = 1000;

    public function __construct(
        protected GeminiService $gemini,
        protected AIContextBuilder $contextBuilder,
        protected AIMonitoringService $monitoring,
    ) {}

    /**
     * NEXA full-page assistant UI.
     */
    public function assistant(Request $request): Response
    {
        return Inertia::render('AI/Assistant');
    }

    /**
     * POST /api/ai/chat
     *
     * Pipeline: Authentication → Role Detection → Intent Detection →
     * Relevant Database Query → Context Builder → Gemini → Response.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:' . self::MAX_MESSAGE_LENGTH,
            'conversation_id' => 'nullable|integer|exists:ai_conversations,id',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $message = trim($validated['message']);

        // 1-2. Role detection & authorization are implicit in the builder:
        // every query below is scoped to the authenticated user's role.
        // 3. Intent detection.
        $intent = $this->contextBuilder->detectIntent($message);

        // 4. Structured actions (visit proposal) resolved from authorized scope.
        $action = null;

        if ($intent === 'visit_create') {
            $action = $this->contextBuilder->findVisitProposal($user, $message);
        }

        if ($intent === 'document_verify') {
            $action = null; // verification data goes into context instead
        }

        // 5-6. Build minimal role-scoped context for Gemini.
        $built = $this->contextBuilder->build($user, $message, $intent);
        $context = $built['context'];

        if ($intent === 'document_verify') {
            $context['DOCUMENT_VERIFICATION'] = $this->contextBuilder->findDocumentVerification($user, $message)
                ?? ['note' => 'Tidak ada dokumen yang cocok dengan kode pada pertanyaan dalam lingkup akses Anda.'];
        }

        $systemInstruction = $this->contextBuilder->systemInstruction($user, $intent, $action);

        // 7. Conversation continuity (last few turns only).
        $conversation = $this->resolveConversation($request, $user, $message);
        $history = $conversation
            ? $conversation->messages()->latest()->take(8)->get()->reverse()
                ->map(fn ($m) => [
                    'role' => $m->role === 'assistant' ? 'model' : 'user',
                    'text' => $m->message,
                ])->all()
            : [];

        // Compact encoding keeps token usage (and quota burn) low.
        $contextJson = json_encode($context, JSON_UNESCAPED_UNICODE);

        $contents = [
            [
                'role' => 'user',
                'text' => "CONTEXT DATA (JSON, sumber kebenaran satu-satunya):\n" . $contextJson,
            ],
            ...$history,
            ['role' => 'user', 'text' => $message],
        ];

        // 8. Call Gemini through the abstraction layer.
        $result = $this->gemini->chat($systemInstruction, $contents);

        if (! $result->ok) {
            Log::warning('AI chat failed for user', ['user_id' => $user->id, 'reason' => $result->error]);

            // All GeminiService errors are pre-curated, user-safe messages.
            return response()->json([
                'status' => 'error',
                'reply' => $result->error ?? 'NEXA sedang mengalami kendala saat menghubungi AI. Silakan coba lagi.',
            ], $result->status === 429 ? 429 : 503);
        }

        // 9. Persist chat history (never stores API keys).
        if ($conversation) {
            $conversation->messages()->createMany([
                ['role' => 'user', 'message' => $message],
                ['role' => 'assistant', 'message' => $result->text],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'reply' => $result->text,
            'timestamp' => now()->format('H:i'),
            'conversation_id' => $conversation?->id,
            'action' => $action,
        ]);
    }

    /**
     * NEXA AI Monitoring Insights page (computed from real data).
     */
    public function insights(Request $request): Response
    {
        return Inertia::render('AI/Insights', [
            'insights' => $this->monitoring->insightsForUser($request->user()),
        ]);
    }

    /**
     * GET /api/ai/insights — computed from real database numbers only.
     */
    public function insightsApi(Request $request): JsonResponse
    {
        return response()->json($this->monitoring->insightsForUser($request->user()));
    }

    private function resolveConversation(Request $request, $user, string $firstMessage): ?AiConversation
    {
        $existingId = $request->input('conversation_id');

        if ($existingId) {
            $conversation = AiConversation::where('user_id', $user->id)->find($existingId);

            if ($conversation) {
                return $conversation;
            }
        }

        return AiConversation::create([
            'user_id' => $user->id,
            'title' => Str::of($firstMessage)->limit(60),
        ]);
    }
}
