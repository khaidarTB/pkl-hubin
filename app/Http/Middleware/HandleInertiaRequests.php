<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Student;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'student' => $user->isSiswa() ? fn () => Student::with([
                        'placement' => fn ($q) => $q->select('id', 'student_id', 'company_id', 'status', 'start_date', 'end_date'),
                        'placement.industry' => fn ($q) => $q->select('id', 'name', 'address'),
                        'latestApplication'
                    ])->where('user_id', $user->id)->first() : null,
                ] : null,
            ],
            'userNotifications' => $user ? fn () => \App\Models\Notification::select('id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(6)
                ->get() : [],
            'unreadNotificationCount' => $user ? fn () => \App\Models\Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count() : 0,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'message' => fn () => $request->session()->get('message'),
            ],
            'waGatewayStatus' => fn () => config('services.wa_gateway.status', 'connected'),
        ]);
    }
}
