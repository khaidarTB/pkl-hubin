<?php

namespace Database\Seeders;

use App\Models\PklPeriod;
use Illuminate\Database\Seeder;

class PklPeriodSeeder extends Seeder
{
    public function run(): void
    {
        PklPeriod::query()->delete();

        $periods = [
            [
                'name' => 'Periode PKL Semester Ganjil 2025/2026',
                'academic_year' => '2025/2026',
                'start_date' => '2025-07-14',
                'end_date' => '2025-12-19',
                'status' => 'completed',
            ],
            [
                'name' => 'Periode PKL Semester Genap 2025/2026',
                'academic_year' => '2025/2026',
                'start_date' => '2026-01-05',
                'end_date' => '2026-06-30',
                'status' => 'completed',
            ],
            [
                'name' => 'Periode PKL Semester Ganjil 2026/2027',
                'academic_year' => '2026/2027',
                'start_date' => '2026-07-13',
                'end_date' => '2026-12-20',
                'status' => 'active',
            ],
            [
                'name' => 'Periode PKL Semester Genap 2026/2027',
                'academic_year' => '2026/2027',
                'start_date' => '2027-01-04',
                'end_date' => '2027-06-25',
                'status' => 'upcoming',
            ],
        ];

        foreach ($periods as $period) {
            PklPeriod::create($period);
        }
    }
}
