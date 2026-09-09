<?php

namespace Database\Seeders;

use App\Models\VisitReport;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class VisitReportSeeder extends Seeder
{
    public function run(): void
    {
        VisitReport::query()->delete();

        $completedVisits = Visit::where('status', 'completed')->get();

        $conditions = [
            'Siswa dalam kondisi baik dan sehat saat dilakukan kunjungan.',
            'Siswa aktif dan menunjukkan semangat belajar yang tinggi.',
            'Siswa hadir tepat waktu dan mengenakan pakaian kerja perusahaan.',
            'Siswa dalam kondisi prima, terlihat antusias mengerjakan tugas harian.',
            'Siswa terlihat fokus mengerjakan pekerjaan yang diberikan pembimbing.',
            'Kondisi siswa baik, tidak ada kendala kesehatan maupun administrasi.',
        ];

        $advances = [
            'Siswa telah menguasai materi dasar dan mulai menangani tugas mandiri.',
            'Kemajuan signifikan pada penguasaan keterampilan teknis.',
            'Siswa sudah mampu bekerja sama dengan tim dan menyelesaikan project kecil.',
            'Perkembangan baik, siswa mulai memahami alur kerja perusahaan.',
        ];

        $obstacles = [
            'Tidak ada kendala berarti yang ditemui.',
            'Terdapat sedikit kendala dalam penggunaan perangkat yang tersedia.',
            'Siswa masih perlu bimbingan dalam berkomunikasi dengan klien.',
            'Kesulitan memahami beberapa SOP yang berlaku di perusahaan.',
        ];

        $feedbacks = [
            'Pembimbing industri puas dengan kinerja dan sikap siswa.',
            'Perlu peningkatan kedisiplinan dalam hal kehadiran.',
            'Siswa sesuai ekspektasi perusahaan, senang bekerja sama.',
            'Pembimbing memberikan apresiasi atas inisiatif siswa.',
        ];

        $recommendations = [
            'Perlu diberikan tugas yang lebih menantang untuk mengasah skill.',
            'Disarankan siswa lebih aktif bertanya dan berdiskusi dengan tim.',
            'Perhatikan konsistensi kehadiran untuk mencapai target kompetensi.',
            'Sesuaikan pelaporan jurnal dengan aktivitas harian yang dilakukan.',
        ];

        foreach ($completedVisits as $index => $visit) {
            VisitReport::create([
                'visit_id' => $visit->id,
                'student_condition' => $conditions[$index % count($conditions)],
                'attendance_status' => rand(0, 1) === 1 ? 'Hadir' : 'Izin',
                'progress_notes' => $advances[$index % count($advances)],
                'obstacles' => $obstacles[$index % count($obstacles)],
                'industry_feedback' => $feedbacks[$index % count($feedbacks)],
                'recommendations' => $recommendations[$index % count($recommendations)],
                'photos' => [
                    "uploads/visits/visit-{$visit->id}-1.jpg",
                    "uploads/visits/visit-{$visit->id}-2.jpg",
                ],
            ]);
        }
    }
}
