<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Data geolokasi check-out yang divalidasi server, simetris dengan check-in.
        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('check_out_server_timestamp')->nullable()->after('check_out');
            $table->decimal('check_out_latitude', 10, 8)->nullable()->after('check_out_server_timestamp');
            $table->decimal('check_out_longitude', 11, 8)->nullable()->after('check_out_latitude');
            $table->decimal('check_out_gps_accuracy', 7, 1)->nullable()->after('check_out_longitude');
            $table->decimal('check_out_distance_from_company', 10, 2)->nullable()->after('check_out_gps_accuracy');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'check_out_server_timestamp',
                'check_out_latitude',
                'check_out_longitude',
                'check_out_gps_accuracy',
                'check_out_distance_from_company',
            ]);
        });
    }
};
