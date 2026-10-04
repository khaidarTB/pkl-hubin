<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken as BaseValidateCsrfToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class ValidateCsrfToken extends BaseValidateCsrfToken
{
    /**
     * The stock middleware throws on a token mismatch, which means the response
     * never receives the XSRF-TOKEN cookie — only the session cookie is refreshed.
     * The browser then keeps replaying the stale token and every subsequent POST
     * fails with 419 until the tab is hard reloaded.
     *
     * Returning the 419 through the pipeline (instead of throwing) lets the
     * normal cookie middleware attach a fresh XSRF-TOKEN, so the next request
     * from the same client is already in sync.
     */
    public function handle($request, Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TokenMismatchException $exception) {
            return $this->reject($request, $exception);
        }
    }

    protected function reject($request, TokenMismatchException $exception): Response
    {
        if ($request->hasSession() && $this->shouldAddXsrfTokenCookie()) {
            Cookie::queue($this->newCookie($request, config('session')));
        }

        return $request->expectsJson()
            ? new JsonResponse(['message' => $exception->getMessage()], 419)
            : response()->view('errors::419', [], 419);
    }
}
