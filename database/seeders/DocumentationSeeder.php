<?php

namespace Database\Seeders;

use App\Models\Documentation;
use App\Models\Placement;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentationSeeder extends Seeder
{
    public function run(): void
    {
        Documentation::query()->delete();

        $activePlacements = Placement::where('status', 'Aktif')->get();
        $guruSupervisors = User::where('role', 'guru')->orderBy('id')->get();

        $categories = ['hari_pertama', 'kegiatan', 'kunjungan', 'presentasi', 'industri', 'penutupan'];

        $titleMap = [
            'hari_pertama' => 'Hari Pertama Masuk PKL',
            'kegiatan' => 'Kegiatan Harian PKL',
            'kunjungan' => 'Kunjungan Monitoring Guru Pembimbing',
            'presentasi' => 'Presentasi Progress PKL',
            'industri' => 'Dokumentasi Kegiatan di Industri',
            'penutupan' => 'Penutupan/Sertifikat PKL',
        ];

        $captionMap = [
            'hari_pertama' => 'Foto bersama pembimbing industri pada hari pertama masuk PKL.',
            'kegiatan' => 'Dokumentasi aktivitas harian siswa selama menjalankan PKL di perusahaan.',
            'kunjungan' => 'Guru pembimbing sedang melakukan monitoring kunjungan ke lokasi PKL.',
            'presentasi' => 'Siswa melakukan presentasi laporan progress PKL di hadapan pembimbing.',
            'industri' => 'Kegiatan dan suasana kerja di lingkungan perusahaan industri.',
            'penutupan' => 'Penyerahan sertifikat dan dokumentasi penutupan program PKL.',
        ];

        $index = 0;
        foreach ($activePlacements->take(15) as $placement) {
            $category = $categories[$index % count($categories)];
            $guru = $guruSupervisors[$index % $guruSupervisors->count()];

            Documentation::create([
                'title' => $titleMap[$category],
                'caption' => $captionMap[$category],
                'company_id' => $placement->company_id,
                'student_id' => $placement->student_id,
                'visit_id' => null,
                'photo_path' => "uploads/documentations/photo-{$placement->student_id}-{$index}.jpg",
                'category' => $category,
                'date' => now()->subDays($index % 20)->toDateString(),
                'is_approved' => $index % 3 !== 0, // sebagian besar disetujui
                'approved_by' => $index % 3 !== 0 ? $guru->id : null,
            ]);

            $index++;
        }
    }
}
