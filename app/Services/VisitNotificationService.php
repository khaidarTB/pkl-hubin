<?php

namespace App\Services;

use App\Models\Visit;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class VisitNotificationService
{
    protected WhatsAppService $waService;

    public function __construct(WhatsAppService $waService)
    {
        $this->waService = $waService;
    }

    /**
     * Notify teacher, student, and admin when a new visit is scheduled.
     * Channels: In-App Web, Email, WhatsApp.
     */
    public function notifyVisitScheduled(Visit $visit): array
    {
        $visit->loadMissing(['teacher', 'student.user', 'company', 'document']);

        $teacher = $visit->teacher;
        $student = $visit->student;
        $studentUser = $student?->user;
        $company = $visit->company;

        $studentName = $studentUser->name ?? 'Siswa PKL';
        $companyName = $company->name ?? 'Perusahaan Mitra';
        $companyAddress = $company->address ?? 'Alamat Industri';
        $formattedDate = Carbon::parse($visit->visit_date)->translatedFormat('l, d F Y');
        $visitTime = $visit->visit_time ?? '09:00 WIB';

        $results = [
            'web' => false,
            'email' => false,
            'whatsapp' => false,
        ];

        // 1. WEB IN-APP NOTIFICATION (Guru)
        if ($teacher) {
            Notification::create([
                'user_id' => $teacher->id,
                'title' => '📅 Penugasan Kunjungan PKL Taruna Bangsa',
                'message' => "Anda dijadwalkan monitoring PKL ke {$studentName} di {$companyName} ({$companyAddress}) pada {$formattedDate} jam {$visitTime}.",
                'type' => 'info',
                'icon' => 'Calendar',
                'link' => '/kunjungan',
            ]);
            $results['web'] = true;
        }

        // WEB IN-APP NOTIFICATION (Siswa)
        if ($studentUser) {
            Notification::create([
                'user_id' => $studentUser->id,
                'title' => '🚚 Kunjungan Monitoring Guru Pembimbing',
                'message' => "Guru pembimbing " . ($teacher->name ?? '') . " akan melakukan kunjungan ke lokasi PKL Anda ({$companyName}) pada {$formattedDate}.",
                'type' => 'info',
                'icon' => 'MapPin',
                'link' => '/kunjungan',
            ]);
        }

        // WEB IN-APP NOTIFICATION (Admins)
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            if (!$teacher || $admin->id !== $teacher->id) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title' => '📅 Jadwal Kunjungan Baru Terbuat',
                    'message' => "{$teacher?->name} dijadwalkan berkunjung ke {$studentName} di {$companyName} pada {$formattedDate}.",
                    'type' => 'info',
                    'icon' => 'Calendar',
                    'link' => '/kunjungan',
                ]);
            }
        }

        // 2. EMAIL NOTIFICATION (Guru)
        if ($teacher && $teacher->email) {
            try {
                $emailSubject = "[SMK Taruna Bangsa] 📅 Penugasan Kunjungan Monitoring PKL - {$studentName}";
                $emailBody = "
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>
                    <div style='background-color: #0f172a; padding: 20px; text-align: center; color: #ffffff;'>
                        <h2 style='margin: 0; font-size: 20px;'>SMK TARUNA BANGSA</h2>
                        <p style='margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;'>Sistem Informasi Management PKL & Monitoring</p>
                    </div>
                    <div style='padding: 24px; background-color: #ffffff;'>
                        <h3 style='color: #0f172a; margin-top: 0;'>Pemberitahuan Penugasan Kunjungan Monitoring</h3>
                        <p>Yth. Bpk/Ibu <strong>{$teacher->name}</strong>,</p>
                        <p>Anda telah dijadwalkan untuk melaksanakan penugasan Kunjungan Monitoring PKL dengan rincian sebagai berikut:</p>
                        
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;'>
                            <tr style='background-color: #f8fafc;'>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%;'>Nama Siswa</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'>{$studentName} ({$student->class})</td>
                            </tr>
                            <tr>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>NIS / Jurusan</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'>{$student->nis} - {$student->major}</td>
                            </tr>
                            <tr style='background-color: #f8fafc;'>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>Nama Perusahaan / PT</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'><strong>{$companyName}</strong></td>
                            </tr>
                            <tr>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>Alamat Industri</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'>{$companyAddress}</td>
                            </tr>
                            <tr style='background-color: #f8fafc;'>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>Tanggal & Jam</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'><strong>{$formattedDate}</strong> ({$visitTime})</td>
                            </tr>
                            <tr>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;'>Tujuan Kunjungan</td>
                                <td style='padding: 10px; border-bottom: 1px solid #e2e8f0;'>{$visit->purpose}</td>
                            </tr>
                        </table>

                        <p>Surat Tugas resmi ber-QR Code telah diterbitkan dan dapat diakses melalui portal PKLConnect.</p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='" . url('/kunjungan') . "' style='background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Buka Portal Kunjungan</a>
                        </div>
                    </div>
                    <div style='background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;'>
                        Email ini dikirim otomatis oleh Sistem Monitoring PKLConnect — SMK Taruna Bangsa.
                    </div>
                </div>
                ";

                Mail::html($emailBody, function ($message) use ($teacher, $emailSubject) {
                    $message->to($teacher->email, $teacher->name)
                        ->subject($emailSubject);
                });

                $results['email'] = true;
                Log::info("Email notification sent to teacher: {$teacher->email}");
            } catch (\Throwable $e) {
                Log::error("Failed sending email to teacher {$teacher->email}: " . $e->getMessage());
            }
        }

        // 3. WHATSAPP NOTIFICATION (Guru)
        $teacherPhone = $teacher->phone ?? $student->phone ?? '08123456789';
        if ($teacherPhone) {
            try {
                $waMessage = "📌 *NOTIFIKASI JADWAL KUNJUNGAN PKL*\n"
                    . "*SMK TARUNA BANGSA*\n\n"
                    . "Yth. Bpk/Ibu *{$teacher->name}*,\n"
                    . "Anda telah dijadwalkan untuk melaksanakan monitoring PKL siswa dengan rincian:\n\n"
                    . "👤 *Siswa:* {$studentName} ({$student->class})\n"
                    . "🏢 *PT/Industri:* {$companyName}\n"
                    . "📍 *Alamat PT:* {$companyAddress}\n"
                    . "📅 *Tanggal:* {$formattedDate}\n"
                    . "⏰ *Jam:* {$visitTime}\n"
                    . "🎯 *Tujuan:* {$visit->purpose}\n\n"
                    . "Surat Tugas resmi telah terbit dan dapat diunduh di:\n"
                    . url('/kunjungan') . "\n\n"
                    . "_PKLConnect System Notification_";

                $this->waService->sendNotification($teacherPhone, $waMessage);
                $results['whatsapp'] = true;
            } catch (\Throwable $e) {
                Log::error("Failed sending WhatsApp notification to {$teacherPhone}: " . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Notify student and admin when visit report is completed.
     */
    public function notifyReportCompleted(Visit $visit): void
    {
        $visit->loadMissing(['teacher', 'student.user', 'company', 'report']);

        $studentUser = $visit->student?->user;
        $teacherName = $visit->teacher?->name ?? 'Guru Pembimbing';

        if ($studentUser) {
            Notification::create([
                'user_id' => $studentUser->id,
                'title' => '✅ Laporan Kunjungan PKL Selesai',
                'message' => "Guru pembimbing {$teacherName} telah menyelesaikan laporan hasil kunjungan monitoring PKL Anda.",
                'type' => 'success',
                'icon' => 'CheckCircle2',
                'link' => '/kunjungan',
            ]);
        }
    }
}
