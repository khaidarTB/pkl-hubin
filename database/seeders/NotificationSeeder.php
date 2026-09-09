<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        Notification::query()->delete();

        $users = User::all();
        $admins = User::where('role', 'admin')->get();
        $gurus = User::where('role', 'guru')->get();
        $siswas = User::where('role', 'siswa')->get();

        // Notifikasi untuk admin
        foreach ([0, 1] as $i) {
            if (isset($admins[$i])) {
                Notification::create([
                    'user_id' => $admins[$i]->id,
                    'title' => 'Aplikasi PKL Baru',
                    'message' => "Terdapat {$siswas->count()} siswa yang mengajukan aplikasi PKL dan menunggu verifikasi.",
                    'type' => 'info',
                    'icon' => 'FileText',
                    'link' => '/admin/applications',
                    'is_read' => $i === 0,
                    'data' => ['count' => $siswas->count()],
                ]);

                Notification::create([
                    'user_id' => $admins[$i]->id,
                    'title' => 'Periode PKL Aktif',
                    'message' => 'Periode PKL Semester Ganjil 2026/2027 sedang berlangsung.',
                    'type' => 'success',
                    'icon' => 'CalendarCheck',
                    'link' => '/admin/placements',
                    'is_read' => false,
                    'data' => null,
                ]);
            }
        }

        // Notifikasi untuk guru
        foreach ($gurus->take(3) as $index => $guru) {
            Notification::create([
                'user_id' => $guru->id,
                'title' => 'Jurnal Menunggu Persetujuan',
                'message' => 'Terdapat jurnal siswa yang belum disetujui dan membutuhkan review Anda.',
                'type' => 'warning',
                'icon' => 'BookOpen',
                'link' => '/guru/journals/approval',
                'is_read' => $index === 0,
                'data' => ['pending' => rand(2, 8)],
            ]);

            Notification::create([
                'user_id' => $guru->id,
                'title' => 'Kunjungan Monitoring Terjadwal',
                'message' => 'Jadwal kunjungan monitoring PKL mendatang membutuhkan konfirmasi Anda.',
                'type' => 'info',
                'icon' => 'CalendarClock',
                'link' => '/guru/monitoring/visits',
                'is_read' => false,
                'data' => null,
            ]);
        }

        // Notifikasi untuk siswa
        foreach ($siswas->take(10) as $index => $siswa) {
            if ($index % 3 === 0) {
                Notification::create([
                    'user_id' => $siswa->id,
                    'title' => 'Aplikasi PKL Disetujui',
                    'message' => 'Selamat! Aplikasi PKL Anda telah disetujui. Silakan cek detail penempatan.',
                    'type' => 'success',
                    'icon' => 'BadgeCheck',
                    'link' => '/siswa/pkl-status',
                    'is_read' => $index % 2 === 0,
                    'data' => null,
                ]);
            } elseif ($index % 3 === 1) {
                Notification::create([
                    'user_id' => $siswa->id,
                    'title' => 'Jurnal Perlu Revisi',
                    'message' => 'Jurnal harian Anda memerlukan revisi. Silakan periksa dan perbaiki.',
                    'type' => 'warning',
                    'icon' => 'CircleAlert',
                    'link' => '/siswa/journals',
                    'is_read' => false,
                    'data' => null,
                ]);
            } else {
                Notification::create([
                    'user_id' => $siswa->id,
                    'title' => 'Jangan Lupa Absensi',
                    'message' => 'Jangan lupa melakukan check-in absensi GPS saat tiba di lokasi PKL.',
                    'type' => 'danger',
                    'icon' => 'MapPin',
                    'link' => '/siswa/attendance',
                    'is_read' => false,
                    'data' => null,
                ]);
            }
        }

        // Beberapa notifikasi untuk pembimbing industri
        $industris = User::where('role', 'industri')->get();
        foreach ($industris->take(2) as $index => $industri) {
            Notification::create([
                'user_id' => $industri->id,
                'title' => 'Penilaian Kompetensi',
                'message' => 'Silakan lengkapi penilaian kompetensi untuk siswa bimbingan Anda.',
                'type' => 'info',
                'icon' => 'ClipboardList',
                'link' => '/industri/assessment',
                'is_read' => false,
                'data' => null,
            ]);
        }
    }
}
