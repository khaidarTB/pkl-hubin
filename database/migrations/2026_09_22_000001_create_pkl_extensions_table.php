<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkl_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('placement_id')->constrained('placements')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->string('requester_role', 20); // guru, industri

            // Snapshot periode lama
            $table->date('old_start_date');
            $table->date('old_end_date');

            // Periode perpanjangan yang diminta
            $table->date('requested_start_date');
            $table->date('requested_end_date');

            // Alasan perpanjangan
            $table->text('reason');

            // Surat perpanjangan (file metadata)
            $table->string('extension_letter_path')->nullable();
            $table->string('extension_letter_original_name')->nullable();
            $table->string('extension_letter_mime', 100)->nullable();
            $table->unsignedInteger('extension_letter_size')->nullable();

            // Status workflow
            $table->string('status', 20)->default('pending'); // pending, approved, rejected, cancelled

            // Review fields
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_feedback')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index('placement_id');
            $table->index('student_id');
            $table->index('status');
            $table->index('requested_by');
            $table->index('reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkl_extensions');
    }
};
