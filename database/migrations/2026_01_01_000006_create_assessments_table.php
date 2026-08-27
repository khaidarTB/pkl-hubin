<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('industry_supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('discipline')->default(5); // 1-5
            $table->integer('responsibility')->default(5);
            $table->integer('teamwork')->default(5);
            $table->integer('communication')->default(5);
            $table->integer('technical_skill')->default(5);
            $table->integer('creativity')->default(5);
            $table->integer('problem_solving')->default(5);
            $table->decimal('total_score', 5, 2)->default(100.00);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
