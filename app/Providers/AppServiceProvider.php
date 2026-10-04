<?php

namespace App\Providers;

use App\Services\GeminiService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // The service reads its credentials from config via its own factory, so the
        // container must not try to auto-wire the scalar constructor parameters.
        $this->app->bind(GeminiService::class, fn () => GeminiService::make());
    }

    public function boot(): void
    {
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute((int) config('services.gemini.rate_limit', 15))
                ->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        if ($this->app->environment('local')) {
            return;
        }

        URL::forceScheme('https');
        URL::forceRootUrl(config('app.url'));
    }
}
