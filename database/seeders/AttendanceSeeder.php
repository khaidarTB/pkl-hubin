<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Placement;
use App\Models\Student;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        Attendance::query()->delete();

        // Ambil siswa yang punya penempatan aktif
        $activePlacements = Placement::where('status', 'Aktif')->get();

        // Koordinat perusahaan aktif (untuk GPS check-in)
        $companyLocations = [
            -6.208763, 106.845599, // Jakarta
            -6.917464, 107.619122, // Bandung
            -7.250445, 112.768845, // Surabaya
            -7.795580, 110.369490, // Yogyakarta
            -6.200000, 106.816666, // Jakarta
        ];

        $statusDistributions = [
            'Hadir' => 85,
            'Izin' => 6,
            'Sakit' => 5,
            'Alpa' => 4,
        ];

        // Buat absensi untuk rentang waktu 1 bulan terakhir (hari kerja saja)
        $startDate = now()->subDays(30);
        $endDate = now();

        foreach ($activePlacements as $placement) {
            $studentId = $placement->student_id;
            $loc = $companyLocations[$placement->id % count($companyLocations)];

            $date = clone $startDate;
            while ($date->lte($endDate)) {
                // Skip weekend (Sabtu/Minggu)
                $dayOfWeek = $date->dayOfWeek;
                if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                    $date->addDay();
                    continue;
                }

                // Tentukan status berdasarkan distribusi
                $rand = rand(1, 100);
                $cumulative = 0;
                $status = 'Hadir';
                foreach ($statusDistributions as $key => $percent) {
                    $cumulative += $percent;
                    if ($rand <= $cumulative) {
                        $status = $key;
                        break;
                    }
                }

                $checkIn = null;
                $checkOut = null;

                if ($status === 'Hadir') {
                    $checkIn = sprintf('%02d:%02d', rand(7, 8), rand(0, 59));
                    $checkOut = sprintf('%02d:%02d', rand(16, 17), rand(0, 59));
                } elseif ($status === 'Izin') {
                    $checkIn = null;
                    $checkOut = null;
                } elseif ($status === 'Sakit') {
                    $checkIn = null;
                    $checkOut = null;
                } elseif ($status === 'Alpa') {
                    $checkIn = null;
                    $checkOut = null;
                }

                Attendance::create([
                    'student_id' => $studentId,
                    'date' => $date->toDateString(),
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'latitude' => $loc + (mt_rand(-10, 10) / 100000),
                    'longitude' => $loc + 0.008 + (mt_rand(-10, 10) / 100000),
                    'location_address' => 'Area Perusahaan Mitra PKL',
                    'status' => $status,
                ]);

                $date->addDay();
            }
        }
    }
}
