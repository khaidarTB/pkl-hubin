<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized access for your role.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Akses ditolak. Peran Anda tidak memiliki izin.');
        }

        return $next($request);
    }
}
