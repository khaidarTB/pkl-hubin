<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->string('city')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('industry_type')->nullable(); // Technology, Creative, Manufacturing, etc.
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('partnership_status')->default('active'); // active, inactive, pending
            $table->integer('student_quota')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
