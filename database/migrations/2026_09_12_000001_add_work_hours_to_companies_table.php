<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Jam kerja per-perusahaan (Asia/Jakarta). Jika NULL, sistem memakai
        // konfigurasi global config('attendance.check_in_window') sebagai fallback.
        Schema::table('companies', function (Blueprint $table) {
            $table->time('jam_masuk')->nullable()->after('allowed_radius');
            $table->time('jam_keluar')->nullable()->after('jam_masuk');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['jam_masuk', 'jam_keluar']);
        });
    }
};
