<?php

namespace Database\Seeders;

use App\Models\Visit;
use App\Models\Placement;
use App\Models\User;
use Illuminate\Database\Seeder;

class VisitSeeder extends Seeder
{
    public function run(): void
    {
        Visit::query()->delete();

        $activePlacements = Placement::where('status', 'Aktif')->get();
        $guruSupervisors = User::where('role', 'guru')->orderBy('id')->get();

        $purposes = [
            'Monitoring perkembangan PKL dan pengecekan kehadiran siswa.',
            'Koordinasi dengan pembimbing industri mengenai capaian kompetensi siswa.',
            'Kunjungan rutin untuk mengevaluasi progres dan kendala siswa di lokasi PKL.',
            'Pengecekan kesesuaian aktivitas siswa dengan kompetensi keahlian.',
            'Evaluasi tahap akhir dan persiapan pelaporan/penilaian.',
        ];

        $statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'in_progress', 'scheduled', 'scheduled', 'cancelled'];

        foreach ($activePlacements->take(10) as $index => $placement) {
            $teacher = $guruSupervisors[$index % $guruSupervisors->count()];
            $status = $statuses[$index % count($statuses)];

            $visitDate = match ($status) {
                'completed' => now()->subDays(rand(5, 25)),
                'in_progress' => now()->subDays(1),
                'scheduled' => now()->addDays(rand(1, 7)),
                'cancelled' => now()->subDays(rand(10, 20)),
            };

            Visit::create([
                'teacher_id' => $teacher->id,
                'student_id' => $placement->student_id,
                'company_id' => $placement->company_id,
                'placement_id' => $placement->id,
                'visit_date' => $visitDate->toDateString(),
                'visit_time' => sprintf('%02d:%02d', rand(9, 14), rand(0, 59)),
                'purpose' => $purposes[$index % count($purposes)],
                'notes' => $status === 'cancelled' ? 'Dijadwalkan ulang karena konflik jadwal guru.' : null,
                'status' => $status,
            ]);
        }
    }
}
