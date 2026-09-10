<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->string('industry_signature')->nullable()->after('industry_supervisor_id');
            $table->string('school_signature')->nullable()->after('industry_signature');
        });
    }

    public function down(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->dropColumn(['industry_signature', 'school_signature']);
        });
    }
};