<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->timestamp('server_timestamp');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('gps_accuracy', 7, 1)->nullable();
            $table->decimal('company_latitude', 10, 8)->nullable();
            $table->decimal('company_longitude', 11, 8)->nullable();
            $table->decimal('distance_from_company', 10, 2)->nullable();
            $table->unsignedInteger('allowed_radius')->nullable();
            $table->string('result')->nullable()->index(); // HADIR, TERLAMBAT, DITOLAK
            $table->string('failure_reason')->nullable(); // LOCATION_OUTSIDE_RADIUS, dll.
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_attempts');
    }
};