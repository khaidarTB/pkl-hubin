<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->nullable()->constrained('document_templates')->onDelete('set null');
            $table->foreignId('visit_id')->nullable()->constrained('visits')->onDelete('set null');
            $table->string('title');
            $table->string('type')->default('surat_tugas'); // surat_tugas, surat_jalan, other
            $table->string('document_number')->nullable();
            $table->string('generated_file_path')->nullable();
            $table->json('data')->nullable(); // filled placeholder data
            $table->string('status')->default('draft'); // draft, pending_signature, signed, final
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
