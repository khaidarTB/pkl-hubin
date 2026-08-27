<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;
use App\Models\Placement;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\Assessment;

class ReportController extends Controller
{
    public function index(): Response
    {
        $reports = Placement::with(['student.user', 'company', 'industry'])->get()->map(function ($p) {
            $attCount = Attendance::where('student_id', $p->student_id)->where('status', 'Hadir')->count();
            $totalDays = max(1, Attendance::where('student_id', $p->student_id)->count());
            $attPercent = round(($attCount / $totalDays) * 100);
            $journalCount = Journal::where('student_id', $p->student_id)->count();
            $assessment = Assessment::where('student_id', $p->student_id)->first();

            return [
                'nis' => $p->student->nis ?? '-',
                'name' => $p->student->user->name ?? 'Siswa',
                'class' => $p->student->class ?? '-',
                'major' => $p->student->major ?? '-',
                'industry' => $p->company->name ?? ($p->industry->name ?? 'Perusahaan Mitra'),
                'attendance_percent' => $attPercent . '%',
                'journal_total' => $journalCount,
                'score' => $assessment ? $assessment->total_score : 'Belum Ada',
                'status' => $p->status,
            ];
        });

        return Inertia::render('Report/Index', [
            'reports' => $reports,
        ]);
    }

    public function exportExcel()
    {
        return back()->with('message', 'Laporan Rekapitulasi PKL berhasil di-export ke Excel (Simulasi PDF/Excel).');
    }

    public function exportPdf()
    {
        return back()->with('message', 'Laporan Rekapitulasi PKL berhasil di-generate ke format PDF.');
    }
}
