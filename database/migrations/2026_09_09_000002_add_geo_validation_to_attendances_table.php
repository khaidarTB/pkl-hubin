<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('server_timestamp')->nullable()->after('status');
            $table->decimal('gps_accuracy', 7, 1)->nullable()->after('location_address');
            $table->decimal('company_latitude', 10, 8)->nullable()->after('gps_accuracy');
            $table->decimal('company_longitude', 11, 8)->nullable()->after('company_latitude');
            $table->decimal('distance_from_company', 10, 2)->nullable()->after('company_longitude');
            $table->unsignedInteger('allowed_radius')->nullable()->after('distance_from_company');
            $table->string('location_status')->nullable()->after('allowed_radius');
            $table->string('time_status')->nullable()->after('location_status');
        });

        // Satu absensi per siswa per hari.
        Schema::table('attendances', function (Blueprint $table) {
            $table->unique(['student_id', 'date'], 'attendances_student_date_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendances_student_date_unique');
            $table->dropColumn([
                'server_timestamp',
                'gps_accuracy',
                'company_latitude',
                'company_longitude',
                'distance_from_company',
                'allowed_radius',
                'location_status',
                'time_status',
            ]);
        });
    }
};