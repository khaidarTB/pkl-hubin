<?php

namespace Database\Seeders;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use Illuminate\Database\Seeder;

class AiSeeder extends Seeder
{
    public function run(): void
    {
        AiConversation::query()->delete();

        $users = User::all();

        $conversations = [
            [
                'title' => 'Rencana Kunjungan Siswa',
                'role' => 'guru',
                'messages' => [
                    [
                        'user' => 'Saya ingin membuat proposal kunjungan monitoring untuk siswa Budi Santoso di PT Digital Nusantara minggu ini. Bagaimana jadwal yang disarankan?',
                        'assistant' => 'Berdasarkan data monitoring, Budi Santoso di PT Digital Nusantara memiliki kehadiran 92%. Saya sarankan kunjungan pada hari Rabu/Kamis siang (10.00-14.00) karena aktivitas siswa cenderung aktif. Selain itu, jarak jurnal terakhir hanya 1 hari, jadi progresnya baik. Apakah Anda ingin saya buatkan proposal surat tugas lengkapnya?',
                    ],
                    [
                        'user' => 'Iya, silakan buatkan proposal surat tugasnya.',
                        'assistant' => 'Baik, saya siapkan draft surat tugas monitoring untuk Budi Santoso di PT Digital Nusantara. Kunjungan dijadwalkan Rabu pukul 10.00 WIB. Silakan periksa detailnya di menu Monitoring dan ajukan jika sudah sesuai.',
                    ],
                ],
            ],
            [
                'title' => 'Analisis Absensi Siswa',
                'role' => 'guru',
                'messages' => [
                    [
                        'user' => 'Berapa banyak siswa yang absensinya di bawah 80% di periode ini?',
                        'assistant' => 'Saat ini terdapat 3 siswa dengan tingkat kehadiran di bawah 80%. Siswa-siswa tersebut perlu perhatian khusus karena berisiko tidak lolos verifikasi PKL. Rekomendasi saya: jadwalkan kunjungan tambahan dan berikan teguran tertulis. Ingin saya tampilkan detail nama siswa dan perusahaan tempat mereka PKL?',
                    ],
                ],
            ],
            [
                'title' => 'Cek Keaslian Dokumen',
                'role' => 'admin',
                'messages' => [
                    [
                        'user' => 'Saya ingin memverifikasi keaslian surat tugas PKL-2026-082-001. Bisa dibantu?',
                        'assistant' => 'Saya dapat membantu memverifikasi dokumen. Silakan berikan nomor surat atau kode verifikasi yang tertera pada dokumen tersebut, atau lakukan scan QR code melalui halaman verifikasi. Setiap dokumen resmi PKLConnect memiliki kode verifikasi unik yang dapat diakses publik untuk memastikan keasliannya.',
                    ],
                ],
            ],
            [
                'title' => 'Bantuan Penilaian Kompetensi',
                'role' => 'industri',
                'messages' => [
                    [
                        'user' => 'Bagaimana cara menilai kompetensi teamwork siswa yang jarang berkomunikasi?',
                        'assistant' => 'Untuk menilai teamwork, amati partisipasi siswa dalam diskusi tim, kesediaan membantu rekan, dan kontribusi dalam penyelesaian tugas kelompok. Jika siswa jarang berkomunikasi, berikan skor 3 dan berikan catatan khusus untuk peningkatan.',
                    ],
                ],
            ],
            [
                'title' => 'Tips Laporan PKL',
                'role' => 'siswa',
                'messages' => [
                    [
                        'user' => 'Kandungan apa saja yang harus ada di laporan PKL?',
                        'assistant' => 'Laporan PKL umumnya berisi: pendahuluan (latar belakang, tujuan), tinjauan umum perusahaan, pelaksanaan PKL (metode, aktivitas harian), hasil dan pembahasan, serta kesimpulan dan saran. Jangan lupa lampiran berisi foto kegiatan dan sertifikat.',
                    ],
                ],
            ],
        ];

        foreach ($conversations as $conv) {
            $user = $users->where('role', $conv['role'])->first();

            if (!$user) {
                continue;
            }

            $conversation = AiConversation::create([
                'user_id' => $user->id,
                'title' => $conv['title'],
            ]);

            foreach ($conv['messages'] as $msg) {
                AiMessage::create([
                    'conversation_id' => $conversation->id,
                    'role' => 'user',
                    'message' => $msg['user'],
                ]);
                AiMessage::create([
                    'conversation_id' => $conversation->id,
                    'role' => 'assistant',
                    'message' => $msg['assistant'],
                ]);
            }
        }
    }
}
