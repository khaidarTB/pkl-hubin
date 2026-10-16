<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Batas akurasi GPS per-perusahaan (meter). Jika NULL, sistem memakai
        // pengaturan global di tabel settings (fallback config/attendance.php).
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedInteger('max_gps_accuracy')->nullable()->after('allowed_radius');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('max_gps_accuracy');
        });
    }
};
