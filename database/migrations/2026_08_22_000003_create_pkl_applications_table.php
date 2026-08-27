<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkl_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->foreignId('pkl_period_id')->nullable()->constrained('pkl_periods')->onDelete('set null');

            // Company info (user-submitted, may differ from companies table)
            $table->string('company_name')->nullable();
            $table->text('company_address')->nullable();
            $table->string('field_of_work')->nullable();
            $table->string('desired_position')->nullable();

            // Documents
            $table->string('cv_file')->nullable();
            $table->string('cover_letter_file')->nullable();
            $table->string('additional_file')->nullable();

            // Status workflow
            $table->string('status')->default('draft');
            // draft -> submitted -> under_review -> revision/approved/rejected

            $table->text('revision_note')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkl_applications');
    }
};
