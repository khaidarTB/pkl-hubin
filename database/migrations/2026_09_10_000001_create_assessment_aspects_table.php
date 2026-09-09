<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_ASPECT_COLUMNS = [
        'discipline',
        'responsibility',
        'teamwork',
        'communication',
        'technical_skill',
        'creativity',
        'problem_solving',
    ];

    private const DEFAULT_ASPECTS = [
        ['Kedisiplinan & Presensi', 'Kepatuhan dan ketepatan waktu presensi selama PKL.'],
        ['Tanggung Jawab & Integritas', 'Tanggung jawab atas tugas serta integritas dalam bekerja.'],
        ['Kerjasama Tim & Adaptasi', 'Kemampuan bekerja sama dan beradaptasi di lingkungan kerja.'],
        ['Komunikasi & Etika Profesional', 'Komunikasi efektif dan etika profesional di industri.'],
        ['Keahlian Teknis & Skill Vokasi', 'Penguasaan keterampilan teknis sesuai bidang.'],
        ['Kreativitas & Inovasi Kerja', 'Kreativitas dan inovasi dalam menyelesaikan pekerjaan.'],
        ['Pemecahan Masalah (Problem Solving)', 'Kemampuan mengidentifikasi dan memecahkan masalah.'],
    ];

    public function up(): void
    {
        Schema::create('assessment_aspects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->unsignedInteger('max_score')->default(100);
            $table->unsignedInteger('min_score')->default(85);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('assessment_aspect_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->onDelete('cascade');
            $table->foreignId('assessment_aspect_id')->constrained()->onDelete('cascade');
            $table->decimal('score', 5, 2)->unsigned();
            $table->timestamps();

            $table->unique(['assessment_id', 'assessment_aspect_id'], 'aspec_score_unique');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->string('status')->default('BELUM')->after('notes');
        });

        $aspectIds = [];
        foreach (self::DEFAULT_ASPECTS as $i => [$name, $description]) {
            $aspectIds[] = DB::table('assessment_aspects')->insertGetId([
                'name' => $name,
                'description' => $description,
                'max_score' => 100,
                'min_score' => 85,
                'sort_order' => $i + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Backfill skor per aspek untuk data assessment lama (skala 1-5 -> 0-100).
        $rows = DB::table('assessments')->select(array_merge(['id'], self::LEGACY_ASPECT_COLUMNS))->get();
        foreach ($rows as $row) {
            $passed = true;
            foreach (self::LEGACY_ASPECT_COLUMNS as $i => $column) {
                $score = (int) $row->{$column} * 20; // 1-5 -> 0-100
                if ($score < 85) {
                    $passed = false;
                }
                DB::table('assessment_aspect_scores')->insert([
                    'assessment_id' => $row->id,
                    'assessment_aspect_id' => $aspectIds[$i],
                    'score' => $score,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            DB::table('assessments')->where('id', $row->id)->update([
                'status' => $passed ? 'LULUS' : 'BELUM',
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_aspect_scores');
        Schema::dropIfExists('assessment_aspects');
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};