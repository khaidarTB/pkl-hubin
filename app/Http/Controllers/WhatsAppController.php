<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\WhatsAppService;

class WhatsAppController extends Controller
{
    public function index(): Response
    {
        $samples = [
            [
                'title' => '⚠️ Peringatan Absensi',
                'recipient' => 'Orang Tua / Wali Andi Saputra (08123456789)',
                'message' => "⚠️ Peringatan Absensi PKLConnect\n\nAndi Saputra belum melakukan absensi PKL hari ini.\n\nSekolah: SMK Taruna Bangsa\nTempat PKL: PT Digital Nusantara\nTanggal: 22 Agustus 2026",
                'status' => 'Terkirim',
                'time' => '08:00 WIB',
            ],
            [
                'title' => '🔔 Approval Jurnal Baru',
                'recipient' => 'Hendra Wijaya (08198765432)',
                'message' => "🔔 Notifikasi Pembimbing Industri\n\nSiswa Rizky Ramadhan telah mengunggah jurnal kegiatan harian baru. Mohon lakukan verifikasi pada portal PKLConnect.",
                'status' => 'Terkirim',
                'time' => '16:35 WIB',
            ],
        ];

        return Inertia::render('WhatsApp/Index', [
            'gatewayStatus' => 'Connected',
            'provider' => 'PKLConnect Gateway Abstraction (Fonnte/Wablas Ready)',
            'samples' => $samples,
        ]);
    }

    public function sendTest(Request $request, WhatsAppService $waService)
    {
        $result = $waService->sendNotification(
            '08123456789',
            '⚠️ Peringatan Absensi: Andi Saputra belum melakukan absensi PKL hari ini.'
        );

        return back()->with('success', 'Pesan notifikasi WhatsApp berhasil dikirim (Simulasi Gateway Connected).');
    }
}
