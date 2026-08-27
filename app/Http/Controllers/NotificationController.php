<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $dbNotifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $notifications = $dbNotifications->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'title' => $item->title,
                'message' => $item->message,
                'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Baru saja',
                'type' => $item->type,
                'unread' => !$item->is_read,
                'link' => $item->link,
            ];
        });

        if ($notifications->isEmpty()) {
            $notifications = [
                [
                    'id' => '1',
                    'title' => 'Jurnal Menunggu Approval',
                    'message' => 'Rizky Ramadhan mengirimkan jurnal kegiatan harian baru.',
                    'time' => '10 menit yang lalu',
                    'type' => 'info',
                    'unread' => true,
                    'link' => '/jurnal',
                ],
                [
                    'id' => '2',
                    'title' => 'Peringatan Absensi Tidak Dilakukan',
                    'message' => 'Andi Saputra belum melakukan absensi masuk PKL hari ini.',
                    'time' => '1 jam yang lalu',
                    'type' => 'warning',
                    'unread' => true,
                    'link' => '/absensi',
                ],
            ];
        }

        return Inertia::render('Notification/Index', [
            'notifications' => $notifications,
        ]);
    }
}
