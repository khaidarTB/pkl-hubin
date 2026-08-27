<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkl_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Periode PKL Semester Ganjil 2026/2027"
            $table->string('academic_year'); // e.g. "2026/2027"
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('upcoming'); // upcoming, active, completed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkl_periods');
    }
};
