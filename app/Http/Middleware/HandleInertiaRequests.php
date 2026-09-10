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
        $studentData = null;
        $userNotifications = [];
        $unreadNotificationCount = 0;

        if ($user) {
            if ($user->isSiswa()) {
                $studentData = Student::with(['placement.industry', 'latestApplication'])->where('user_id', $user->id)->first();
            }
            $userNotifications = \App\Models\Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(6)
                ->get();
            $unreadNotificationCount = \App\Models\Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'student' => $studentData,
                ] : null,
            ],
            'userNotifications' => $userNotifications,
            'unreadNotificationCount' => $unreadNotificationCount,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'message' => fn () => $request->session()->get('message'),
            ],
            'waGatewayStatus' => env('WA_GATEWAY_STATUS', 'connected'),
        ]);
    }
}
