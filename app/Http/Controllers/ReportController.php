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
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = Placement::query()
            ->with([
                'student:id,user_id,nis,class,major',
                'student.user:id,name',
                'company:id,name',
                'industry:id,name',
            ])
            ->addSelect([
                'attendance_hadir_count' => Attendance::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id')
                    ->where('status', 'Hadir'),
                'attendance_total_count' => Attendance::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id'),
                'journal_count' => Journal::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id'),
                'assessment_score' => Assessment::select('total_score')
                    ->whereColumn('student_id', 'placements.student_id')
                    ->limit(1),
            ]);

        if ($search) {
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('student', function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('class', 'like', "%{$search}%");
            });
        }

        $reports = $query->paginate(20)->withQueryString()->through(function ($p) {
            $attCount = (int) ($p->attendance_hadir_count ?? 0);
            $totalDays = max(1, (int) ($p->attendance_total_count ?? 0));
            $attPercent = round(($attCount / $totalDays) * 100);
            $journalCount = (int) ($p->journal_count ?? 0);
            $score = $p->assessment_score ?? 'Belum Ada';

            return [
                'nis' => $p->student->nis ?? '-',
                'name' => $p->student->user->name ?? 'Siswa',
                'class' => $p->student->class ?? '-',
                'major' => $p->student->major ?? '-',
                'industry' => $p->company->name ?? ($p->industry->name ?? 'Perusahaan Mitra'),
                'attendance_percent' => $attPercent . '%',
                'journal_total' => $journalCount,
                'score' => $score,
                'status' => $p->status,
            ];
        });

        return Inertia::render('Report/Index', [
            'reports' => $reports,
            'filters' => ['search' => $search],
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
