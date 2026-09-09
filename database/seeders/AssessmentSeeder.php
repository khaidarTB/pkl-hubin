<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Placement;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        Assessment::query()->delete();

        $placements = Placement::whereIn('status', ['Aktif', 'Selesai'])->get();

        $notesList = [
            'Siswa menunjukkan dedikasi dan kemampuan teknis yang baik selama PKL.',
            'Perlu peningkatan pada kemampuan komunikasi dan kolaborasi tim.',
            'Kinerja sangat baik, mampu menyelesaikan tugas dengan tepat waktu.',
            'Siswa cepat beradaptasi dengan lingkungan kerja dan budaya perusahaan.',
            'Potensi besar dalam pengembangan aplikasi. Direkomendasikan untuk direkrut.',
            'Kedisiplinan perlu ditingkatkan, namun kualitas kerja cukup baik.',
            'Kemampuan analitis yang sangat baik dalam memecahkan masalah.',
            'Siswa memiliki etika kerja yang baik dan bertanggung jawab.',
        ];

        foreach ($placements as $placement) {
            // Buat skor acak antara 3-5 untuk tiap kompetensi
            $discipline = rand(3, 5);
            $responsibility = rand(3, 5);
            $teamwork = rand(3, 5);
            $communication = rand(3, 5);
            $technical_skill = rand(3, 5);
            $creativity = rand(3, 5);
            $problem_solving = rand(3, 5);

            $total = ($discipline + $responsibility + $teamwork + $communication + $technical_skill + $creativity + $problem_solving) / 7;

            Assessment::create([
                'student_id' => $placement->student_id,
                'industry_supervisor_id' => $placement->industry_supervisor_id,
                'discipline' => $discipline,
                'responsibility' => $responsibility,
                'teamwork' => $teamwork,
                'communication' => $communication,
                'technical_skill' => $technical_skill,
                'creativity' => $creativity,
                'problem_solving' => $problem_solving,
                'total_score' => round($total * 20, 2),
                'notes' => $notesList[rand(0, count($notesList) - 1)],
            ]);
        }
    }
}
