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

class MonitoringController extends Controller
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
                'schoolSupervisor:id,name',
                'industrySupervisor:id,name',
            ])
            ->addSelect([
                'attendance_hadir_count' => Attendance::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id')
                    ->where('status', 'Hadir'),
                'attendance_total_count' => Attendance::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id'),
                'journal_count' => Journal::selectRaw('count(*)')
                    ->whereColumn('student_id', 'placements.student_id'),
            ]);

        if ($search) {
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('student', function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('class', 'like', "%{$search}%");
            });
        }

        $placements = $query->paginate(15)->withQueryString()->through(function ($p) {
            $attCount = (int) ($p->attendance_hadir_count ?? 0);
            $totalDays = max(1, (int) ($p->attendance_total_count ?? 0));
            $attPercent = round(($attCount / $totalDays) * 100);
            $journalCount = (int) ($p->journal_count ?? 0);

            $statusBadge = 'Aman';
            if ($p->status === 'Bermasalah' || $attPercent < 80) {
                $statusBadge = 'Bermasalah';
            } elseif ($journalCount < 3 || $attPercent < 90) {
                $statusBadge = 'Perlu Perhatian';
            }

            return [
                'id' => $p->student->id ?? 0,
                'nis' => $p->student->nis ?? '-',
                'name' => $p->student->user->name ?? 'Siswa',
                'class' => $p->student->class ?? '-',
                'major' => $p->student->major ?? '-',
                'industry_name' => $p->company->name ?? ($p->industry->name ?? 'Perusahaan Mitra'),
                'school_supervisor' => $p->schoolSupervisor->name ?? 'Belum Diatur',
                'industry_supervisor' => $p->industrySupervisor->name ?? 'Belum Diatur',
                'attendance_percent' => $attPercent,
                'journal_filled' => $journalCount,
                'status' => $statusBadge,
                'placement_status' => $p->status,
            ];
        });

        return Inertia::render('Monitoring/Index', [
            'students' => $placements,
            'filters' => ['search' => $search],
        ]);
    }

    public function show($id): Response
    {
        $student = Student::with([
            'user:id,name,email',
            'placement.company:id,name,address',
            'placement.industry:id,name,address',
            'placement.schoolSupervisor:id,name',
            'placement.industrySupervisor:id,name'
        ])->findOrFail($id);

        $attendances = Attendance::where('student_id', $student->id)->orderBy('date', 'desc')->paginate(20)->withQueryString();
        $journals = Journal::where('student_id', $student->id)->orderBy('date', 'desc')->paginate(15)->withQueryString();
        $assessment = Assessment::where('student_id', $student->id)->first();

        $attCount = Attendance::where('student_id', $student->id)->where('status', 'Hadir')->count();
        $totalDays = max(1, Attendance::where('student_id', $student->id)->count());
        $attPercent = round(($attCount / $totalDays) * 100);

        return Inertia::render('Monitoring/Detail', [
            'student' => [
                'id' => $student->id,
                'name' => $student->user->name,
                'email' => $student->user->email,
                'nis' => $student->nis,
                'class' => $student->class,
                'major' => $student->major,
                'phone' => $student->phone,
                'industry' => $student->placement->company->name ?? ($student->placement->industry->name ?? '-'),
                'industry_address' => $student->placement->company->address ?? ($student->placement->industry->address ?? '-'),
                'school_supervisor' => $student->placement->schoolSupervisor->name ?? '-',
                'industry_supervisor' => $student->placement->industrySupervisor->name ?? '-',
                'start_date' => $student->placement->start_date ?? '-',
                'end_date' => $student->placement->end_date ?? '-',
                'status' => $student->placement->status ?? 'Aktif',
            ],
            'stats' => [
                'attendance_percent' => $attPercent,
                'total_journals' => Journal::where('student_id', $student->id)->count(),
                'approved_journals' => Journal::where('student_id', $student->id)->where('status', 'Approved')->count(),
                'temp_score' => $assessment ? $assessment->total_score : 91.5,
            ],
            'attendances' => $attendances,
            'journals' => $journals,
            'assessment' => $assessment,
        ]);
    }
}
