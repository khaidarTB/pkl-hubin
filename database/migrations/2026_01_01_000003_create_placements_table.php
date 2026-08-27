<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('industry_id')->nullable()->constrained('industries')->onDelete('cascade');
            $table->foreignId('school_supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('industry_supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('Aktif'); // Belum Mulai, Aktif, Terlambat, Selesai, Bermasalah
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placements');
    }
};
