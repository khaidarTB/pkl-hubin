<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('verification_code')->unique(); // e.g. PKL-2026-082-001
            $table->string('verification_token')->unique()->index(); // Cryptographically secure token
            $table->string('document_type')->default('surat_tugas');
            $table->string('document_number'); // e.g. PKL/SMK-TB/082/2026
            $table->enum('status', ['VALID', 'REVOKED', 'EXPIRED'])->default('VALID');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_verifications');
    }
};
