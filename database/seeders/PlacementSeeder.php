<?php

namespace Database\Seeders;

use App\Models\Placement;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class PlacementSeeder extends Seeder
{
    public function run(): void
    {
        Placement::query()->delete();

        // Pilih siswa yang aplikasinya approved
        $approvedApplications = \App\Models\PklApplication::where('status', 'approved')
            ->orderBy('id')
            ->get()
            ->values();

        $guruSupervisors = User::where('role', 'guru')->orderBy('id')->get();
        $industriSupervisors = User::where('role', 'industri')->orderBy('id')->get();
        $admin = User::where('role', 'admin')->first();
        $companies = \App\Models\Company::orderBy('id')->get();
        $industries = \App\Models\Industry::orderBy('id')->get();

        // Status placement ditentukan dari aplikasi:
        // - Aplikasi di periode completed + sudah lama => Selesai
        // - Aplikasi di periode aktif => Aktif
        // - Aplikasi periode aktif tapi index tertentu => Belum Mulai
        $count = min(15, $approvedApplications->count());

        for ($i = 0; $i < $count; $i++) {
            $application = $approvedApplications[$i];
            $company = $companies[$i % $companies->count()];
            $industry = $industries[$i % $industries->count()];

            // Tentukan status berdasarkan periode & index
            $period = $application->period;

            $status = 'Aktif';
            if ($period && $period->status === 'completed') {
                $status = 'Selesai';
            } elseif ($i >= 13) {
                $status = 'Belum Mulai';
            }

            $startDate = match ($status) {
                'Selesai' => $period->start_date ?? now()->subMonths(4)->toDateString(),
                'Belum Mulai' => now()->addWeek()->toDateString(),
                default => now()->subMonth()->toDateString(),
            };

            $endDate = match ($status) {
                'Selesai' => $period->end_date ?? now()->subMonth()->toDateString(),
                default => now()->addMonths(2)->toDateString(),
            };

            Placement::create([
                'student_id' => $application->student_id,
                'industry_id' => $industry->id,
                'company_id' => $company->id,
                'pkl_application_id' => $application->id,
                'pkl_period_id' => $period ? $period->id : null,
                'school_supervisor_id' => $guruSupervisors[$i % $guruSupervisors->count()]->id,
                'industry_supervisor_id' => $industriSupervisors[$i % $industriSupervisors->count()]->id,
                'placed_by' => $admin->id,
                'placed_at' => now()->subMonths(1)->toDateTimeString(),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ]);
        }
    }
}