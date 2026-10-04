<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes based on audit findings.
 *
 * Every index here corresponds to a WHERE / ORDER BY / JOIN pattern
 * found in at least one controller.  Composite indexes are ordered
 * to match the most selective column first.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── attendances ──────────────────────────────────────────────
        // Used by: Dashboard (N+1 counts), AttendanceController (today check),
        //          Monitoring, Report — WHERE student_id = ? AND status = ?
        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['student_id', 'status'], 'idx_att_student_status');
            $table->index(['student_id', 'date'], 'idx_att_student_date');
            $table->index('status', 'idx_att_status');
            $table->index('date', 'idx_att_date');
        });

        // ── journals ─────────────────────────────────────────────────
        // Used by: Dashboard (N+1 counts), JournalController approval list
        Schema::table('journals', function (Blueprint $table) {
            $table->index(['student_id', 'status'], 'idx_jrn_student_status');
            $table->index(['student_id', 'date'], 'idx_jrn_student_date');
        });

        // ── notifications ────────────────────────────────────────────
        // Used by: HandleInertiaRequests (every page load)
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read'], 'idx_notif_user_read');
            $table->index(['user_id', 'created_at'], 'idx_notif_user_created');
        });

        // ── placements ───────────────────────────────────────────────
        // Used by: Dashboard, Monitoring, guruDashboard, industriDashboard
        Schema::table('placements', function (Blueprint $table) {
            $table->index('status', 'idx_plc_status');
            $table->index('school_supervisor_id', 'idx_plc_school_sup');
            $table->index('industry_supervisor_id', 'idx_plc_industry_sup');
            $table->index('company_id', 'idx_plc_company');
        });

        // ── users ────────────────────────────────────────────────────
        // Used by: Multiple controllers for role-based lookups
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_users_role');
        });

        // ── pkl_applications ─────────────────────────────────────────
        // Used by: Dashboard, PklApplicationController
        Schema::table('pkl_applications', function (Blueprint $table) {
            $table->index('status', 'idx_pklapp_status');
            $table->index('student_id', 'idx_pklapp_student');
        });

        // ── students ─────────────────────────────────────────────────
        // Used by: AttendanceController filter
        Schema::table('students', function (Blueprint $table) {
            $table->index('class', 'idx_students_class');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_att_student_status');
            $table->dropIndex('idx_att_student_date');
            $table->dropIndex('idx_att_status');
            $table->dropIndex('idx_att_date');
        });

        Schema::table('journals', function (Blueprint $table) {
            $table->dropIndex('idx_jrn_student_status');
            $table->dropIndex('idx_jrn_student_date');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notif_user_read');
            $table->dropIndex('idx_notif_user_created');
        });

        Schema::table('placements', function (Blueprint $table) {
            $table->dropIndex('idx_plc_status');
            $table->dropIndex('idx_plc_school_sup');
            $table->dropIndex('idx_plc_industry_sup');
            $table->dropIndex('idx_plc_company');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
        });

        Schema::table('pkl_applications', function (Blueprint $table) {
            $table->dropIndex('idx_pklapp_status');
            $table->dropIndex('idx_pklapp_student');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('idx_students_class');
        });
    }
};
