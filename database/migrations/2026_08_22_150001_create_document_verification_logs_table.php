<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_verification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_verification_id')->constrained('document_verifications')->onDelete('cascade');
            $table->timestamp('verified_at');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_verification_logs');
    }
};
