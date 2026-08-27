<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('industry_id')->constrained('companies')->onDelete('set null');
            $table->foreignId('pkl_application_id')->nullable()->after('company_id')->constrained('pkl_applications')->onDelete('set null');
            $table->foreignId('pkl_period_id')->nullable()->after('pkl_application_id')->constrained('pkl_periods')->onDelete('set null');
            $table->foreignId('placed_by')->nullable()->after('industry_supervisor_id')->constrained('users')->onDelete('set null');
            $table->timestamp('placed_at')->nullable()->after('placed_by');
        });
    }

    public function down(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['pkl_application_id']);
            $table->dropForeign(['pkl_period_id']);
            $table->dropForeign(['placed_by']);
            $table->dropColumn(['company_id', 'pkl_application_id', 'pkl_period_id', 'placed_by', 'placed_at']);
        });
    }
};
