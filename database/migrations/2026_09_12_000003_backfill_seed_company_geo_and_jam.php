<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Backfill koordinat untuk perusahaan seed yang dibuat SETELAH migrasi geo
        // (rows dibuat seeder, sehingga backfill asli di 2026_09_09_000001 belum
        // menjangkau). Hanya mengisi yang masih kosong — tidak menimpa edit admin.
        $seedCoordinates = [
            'PT Digital Nusantara' => [-6.208763, 106.845599],
            'PT Karya Teknologi Indonesia' => [-6.917464, 107.619122],
            'PT Bank Central Asia' => [-6.181800, 106.822300],
            'PT Graha Media Nusantara' => [-7.257500, 112.752100],
            'CV Maju Jaya Komputer' => [-7.795580, 110.369490],
            'PT Rumah Sakit Harapan Sehat' => [-6.150000, 106.750000],
            'PT Bali Digital Creative' => [-8.670500, 115.212630],
            'PT Semarang Automotif' => [-6.966667, 110.416667],
        ];

        foreach ($seedCoordinates as $name => [$lat, $lng]) {
            DB::table('companies')
                ->where('name', $name)
                ->whereNull('latitude')
                ->update(['latitude' => $lat, 'longitude' => $lng]);
        }

        // Default jam kerja untuk perusahaan seed yang belum mengatur jam sendiri,
        // supaya absensi langsung bisa berjalan (admin tetap bisa ubah per-company).
        DB::table('companies')
            ->whereIn('name', array_keys($seedCoordinates))
            ->whereNull('jam_masuk')
            ->update(['jam_masuk' => '07:00', 'jam_keluar' => '16:00']);
    }

    public function down(): void
    {
        // Tidak ada rollback destruktif: hanya mengisi nilai yang sebelumnya kosong.
    }
};
