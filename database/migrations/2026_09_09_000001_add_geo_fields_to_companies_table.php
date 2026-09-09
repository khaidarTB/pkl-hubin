<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('city');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->unsignedInteger('allowed_radius')->default(100)->after('longitude');
        });

        // Backfill koordinat untuk perusahaan seeded (hanya yang masih kosong).
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
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'allowed_radius']);
        });
    }
};