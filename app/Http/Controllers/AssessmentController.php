<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Assessment;
use App\Models\AssessmentAspect;
use App\Models\AssessmentAspectScore;
use App\Models\Student;
use App\Models\Placement;

class AssessmentController extends Controller
{
    private function activeAspects()
    {
        return AssessmentAspect::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'description', 'max_score', 'min_score', 'sort_order']);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $aspects = $this->activeAspects();

        if ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            $assessment = $student
                ? Assessment::with(['supervisor', 'aspectScores.aspect'])
                    ->where('student_id', $student->id)
                    ->first()
                : null;

            return Inertia::render('Assessment/SiswaView', [
                'assessment' => $assessment,
                'aspects' => $aspects,
            ]);
        }

        if ($user->isIndustri()) {
            $placements = Placement::with(['student.user', 'student.assessment.aspectScores.aspect'])
                ->where('industry_supervisor_id', $user->id)
                ->get();

            return Inertia::render('Assessment/IndustriForm', [
                'students' => $placements->map(fn($p) => [
                    'id' => $p->student->id,
                    'name' => $p->student->user->name,
                    'class' => $p->student->class,
                    'major' => $p->student->major,
                    'assessment' => $p->student->assessment,
                ]),
                'aspects' => $aspects,
            ]);
        }

        // Admin / Guru
        $assessments = Assessment::with([
            'student.user',
            'student.placement.company',
            'student.placement.industry',
            'supervisor',
            'aspectScores.aspect',
        ])->orderBy('updated_at', 'desc')->get();

        $assessedStudentIds = $assessments->pluck('student_id')->toArray();

        $unassessedStudents = Placement::with(['student.user', 'company', 'industry', 'industrySupervisor'])
            ->whereNotIn('student_id', $assessedStudentIds)
            ->where('status', 'Aktif')
            ->get()
            ->map(fn($p) => [
                'id' => $p->student->id,
                'name' => $p->student->user->name ?? 'Siswa',
                'nis' => $p->student->nis ?? '-',
                'class' => $p->student->class ?? '-',
                'major' => $p->student->major ?? '-',
                'company' => $p->company->name ?? ($p->industry->name ?? 'Mitra Industri'),
                'supervisor' => $p->industrySupervisor->name ?? 'Belum Ditugaskan',
            ]);

        $avgScore = $assessments->avg('total_score');
        $highestScore = $assessments->max('total_score');

        return Inertia::render('Assessment/AdminIndex', [
            'assessments' => $assessments,
            'unassessedStudents' => $unassessedStudents,
            'aspects' => $aspects,
            'stats' => [
                'total_assessed' => $assessments->count(),
                'total_lulus' => $assessments->where('status', 'LULUS')->count(),
                'total_belum' => $assessments->where('status', 'BELUM')->count(),
                'total_unassessed' => $unassessedStudents->count(),
                'avg_score' => $avgScore ? round($avgScore, 1) : 0,
                'highest_score' => $highestScore ?? 0,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $aspects = $this->activeAspects();

        if ($aspects->isEmpty()) {
            return back()->withErrors([
                'aspect_scores' => 'Belum ada aspek penilaian aktif. Konfigurasi aspek terlebih dahulu di menu Aspek Nilai.',
            ]);
        }

        $rules = [
            'student_id' => 'required|exists:students,id',
            'notes' => 'nullable|string',
        ];

        foreach ($aspects as $aspect) {
            $rules["aspect_scores.{$aspect->id}"] = [
                'required', 'numeric', 'min:0', "max:{$aspect->max_score}",
            ];
        }

        $validated = $request->validate($rules);

        $total = 0;
        $passed = true;
        $count = $aspects->count();

        foreach ($aspects as $aspect) {
            $score = (float) $validated['aspect_scores'][$aspect->id];
            $total += ($score / $aspect->max_score) * 100;

            if ($score < $aspect->min_score) {
                $passed = false;
            }
        }

        $totalScore = round($total / $count, 2);
        $status = $passed ? 'LULUS' : 'BELUM';

        $student = Student::with('placement')->find($validated['student_id']);
        $supervisorId = $request->user()->isIndustri()
            ? $request->user()->id
            : ($student->placement?->industry_supervisor_id ?? $request->user()->id);

        $assessment = Assessment::updateOrCreate(
            ['student_id' => $validated['student_id']],
            [
                'industry_supervisor_id' => $supervisorId,
                'total_score' => $totalScore,
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        foreach ($aspects as $aspect) {
            AssessmentAspectScore::updateOrCreate(
                ['assessment_id' => $assessment->id, 'assessment_aspect_id' => $aspect->id],
                ['score' => $validated['aspect_scores'][$aspect->id]]
            );
        }

        return back()->with(
            'success',
            "Penilaian kompetensi siswa berhasil disimpan. Total: {$totalScore}/100, status ".
            ($passed ? 'LULUS' : 'BELUM LULUS').'.'
        );
    }

    public function destroy($id)
    {
        $assessment = Assessment::with('student.user')->findOrFail($id);
        $studentName = $assessment->student->user->name ?? 'Siswa';
        $assessment->delete();

        return back()->with('success', "Penilaian untuk {$studentName} berhasil dihapus/direset.");
    }
}