<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Assessment;
use App\Models\Student;
use App\Models\Placement;

class AssessmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            $assessment = Assessment::with('supervisor')->where('student_id', $student->id)->first();

            return Inertia::render('Assessment/SiswaView', [
                'assessment' => $assessment,
            ]);
        }

        if ($user->isIndustri()) {
            $placements = Placement::with(['student.user', 'student.assessment'])
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
            ]);
        }

        // Admin / Guru
        $assessments = Assessment::with(['student.user', 'student.placement.industry', 'supervisor'])->get();

        return Inertia::render('Assessment/AdminIndex', [
            'assessments' => $assessments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'discipline' => 'required|integer|min:1|max:5',
            'responsibility' => 'required|integer|min:1|max:5',
            'teamwork' => 'required|integer|min:1|max:5',
            'communication' => 'required|integer|min:1|max:5',
            'technical_skill' => 'required|integer|min:1|max:5',
            'creativity' => 'required|integer|min:1|max:5',
            'problem_solving' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string',
        ]);

        $scores = [
            $validated['discipline'],
            $validated['responsibility'],
            $validated['teamwork'],
            $validated['communication'],
            $validated['technical_skill'],
            $validated['creativity'],
            $validated['problem_solving'],
        ];

        $avgScore = array_sum($scores) / count($scores);
        $totalScore = round(($avgScore / 5) * 100, 2);

        Assessment::updateOrCreate(
            ['student_id' => $validated['student_id']],
            array_merge($validated, [
                'industry_supervisor_id' => $request->user()->id,
                'total_score' => $totalScore,
            ])
        );

        return back()->with('success', 'Penilaian siswa berhasil disimpan. Total nilai: ' . $totalScore . '/100');
    }
}
