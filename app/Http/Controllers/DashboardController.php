<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;
use App\Models\Company;
use App\Models\Placement;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\Assessment;
use App\Models\PklApplication;
use App\Models\Visit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        } elseif ($user->isGuru()) {
            return $this->guruDashboard($user);
        } elseif ($user->isIndustri()) {
            return $this->industriDashboard($user);
        } else {
            return $this->siswaDashboard($user);
        }
    }

    private function adminDashboard(): Response
    {
        // ── Stat cards: single count queries (cheap, indexed) ────────
        $totalStudents = Student::count();
        $pendingApplications = PklApplication::where('status', PklApplication::STATUS_SUBMITTED)->count();

        $unplacedStudents = Student::whereHas('latestApplication', fn ($q) => $q->where('status', PklApplication::STATUS_APPROVED))
            ->whereDoesntHave('placement')
            ->count();

        // Use a single query for placement status counts
        $placementCounts = Placement::query()
            ->selectRaw("
                SUM(CASE WHEN status = 'Aktif' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Bermasalah' THEN 1 ELSE 0 END) as trouble,
                SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as completed
            ")
            ->first();

        $activeStudents = (int) ($placementCounts->active ?? 0);
        $troubleStudents = (int) ($placementCounts->trouble ?? 0);
        $completedStudents = (int) ($placementCounts->completed ?? 0);

        // Chart Data
        $attendanceTrends = [
            ['day' => 'Senin', 'Hadir' => 118, 'Izin' => 6, 'Alpa' => 4],
            ['day' => 'Selasa', 'Hadir' => 120, 'Izin' => 5, 'Alpa' => 3],
            ['day' => 'Rabu', 'Hadir' => 116, 'Izin' => 8, 'Alpa' => 4],
            ['day' => 'Kamis', 'Hadir' => 122, 'Izin' => 4, 'Alpa' => 2],
            ['day' => 'Jumat', 'Hadir' => 119, 'Izin' => 7, 'Alpa' => 2],
        ];

        $journalCompletion = [
            ['name' => 'Terisi Tepat Waktu', 'value' => 84, 'fill' => '#22C55E'],
            ['name' => 'Menunggu Approval', 'value' => 28, 'fill' => '#3B82F6'],
            ['name' => 'Belum Mengisi', 'value' => 16, 'fill' => '#EF4444'],
        ];

        $statusDistribution = [
            ['name' => 'Aktif', 'count' => $activeStudents, 'fill' => '#22C55E'],
            ['name' => 'Bermasalah', 'count' => $troubleStudents, 'fill' => '#EF4444'],
            ['name' => 'Selesai', 'count' => $completedStudents, 'fill' => '#3B82F6'],
            ['name' => 'Belum Mulai', 'count' => $unplacedStudents, 'fill' => '#64748B'],
        ];

        $industryDistribution = Company::withCount(['placements' => function ($q) {
            $q->where('status', 'Aktif');
        }])->get(['id', 'name'])->map(function ($c) {
            return ['name' => $c->name, 'students' => $c->placements_count];
        });

        // ── Monitoring Student Table — FIXED N+1 ────────────────────
        // Use withCount to batch-load attendance/journal counts instead
        // of running separate queries per student inside map().
        $placements = Placement::with([
                'student.user:id,name,email',
                'company:id,name',
                'industry:id,name',
                'schoolSupervisor:id,name',
            ])
            ->withCount([
                'student as att_hadir_count' => function ($q) {
                    $q->join('attendances', 'students.id', '=', 'attendances.student_id')
                      ->where('attendances.status', 'Hadir');
                },
            ])
            ->paginate(50)
            ->through(function ($p) {
                // Batch-loaded via subquery — no N+1
                $studentId = $p->student_id;
                static $attCounts = null;
                static $journalCounts = null;

                // Lazy-init batch lookups on first call
                if ($attCounts === null) {
                    $attCounts = Attendance::query()
                        ->select('student_id')
                        ->selectRaw("COUNT(*) as total")
                        ->selectRaw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir")
                        ->groupBy('student_id')
                        ->pluck(DB::raw("JSON_OBJECT('total', total, 'hadir', hadir)"), 'student_id')
                        ->map(fn ($v) => json_decode($v, true));

                    $journalCounts = Journal::query()
                        ->select('student_id')
                        ->selectRaw("COUNT(*) as total")
                        ->groupBy('student_id')
                        ->pluck('total', 'student_id');
                }

                $att = $attCounts[$studentId] ?? ['total' => 0, 'hadir' => 0];
                $totalDays = max(1, $att['total']);
                $attendancePercent = round(($att['hadir'] / $totalDays) * 100);
                $journalCount = $journalCounts[$studentId] ?? 0;

                $statusBadge = 'Aman';
                if ($p->status === 'Bermasalah' || $attendancePercent < 80) {
                    $statusBadge = 'Bermasalah';
                } elseif ($journalCount < 3 || $attendancePercent < 90) {
                    $statusBadge = 'Perlu Perhatian';
                }

                return [
                    'id' => $p->student->id,
                    'placement_id' => $p->id,
                    'name' => $p->student->user->name ?? 'Siswa',
                    'email' => $p->student->user->email ?? '-',
                    'nis' => $p->student->nis ?? '-',
                    'class' => $p->student->class ?? '-',
                    'major' => $p->student->major ?? '-',
                    'phone' => $p->student->phone ?? '-',
                    'industry' => $p->company->name ?? ($p->industry->name ?? 'Perusahaan Mitra'),
                    'attendance_percent' => $attendancePercent,
                    'journal_count' => "{$journalCount} / 25",
                    'status' => $statusBadge,
                    'placement_status' => $p->status,
                    'school_supervisor_id' => $p->school_supervisor_id,
                    'school_supervisor' => $p->schoolSupervisor->name ?? 'Belum Ditugaskan',
                    'start_date' => $p->start_date ? Carbon::parse($p->start_date)->format('Y-m-d') : '-',
                    'end_date' => $p->end_date ? Carbon::parse($p->end_date)->format('Y-m-d') : '-',
                ];
            });

        // Early Warning Metrics (Mid-Period Monitoring Alert)
        $earlyWarning = [
            'mid_period_alert' => true,
            'period_progress' => '50%',
            'unvisited_count' => 8,
            'low_attendance_count' => 3,
            'incomplete_journal_count' => 5,
        ];

        $teachers = User::where('role', 'guru')->get(['id', 'name']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'pending_approval' => $pendingApplications,
                'unplaced_students' => $unplacedStudents,
                'active_students' => $activeStudents,
                'trouble_students' => $troubleStudents,
                'completed_students' => $completedStudents,
            ],
            'charts' => [
                'attendanceTrends' => $attendanceTrends,
                'journalCompletion' => $journalCompletion,
                'statusDistribution' => $statusDistribution,
                'industryDistribution' => $industryDistribution,
            ],
            'studentsMonitoring' => $placements,
            'earlyWarning' => $earlyWarning,
            'teachers' => $teachers,
        ]);
    }

    private function guruDashboard($user): Response
    {
        $placements = Placement::with(['student.user:id,name,email', 'company:id,name', 'industry:id,name'])
            ->where('school_supervisor_id', $user->id)
            ->get();

        // Batch-load attendance/journal counts — FIXES N+1
        $studentIds = $placements->pluck('student_id')->unique()->values();

        $attData = Attendance::query()
            ->whereIn('student_id', $studentIds)
            ->select('student_id')
            ->selectRaw("COUNT(*) as total")
            ->selectRaw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir")
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $journalData = Journal::query()
            ->whereIn('student_id', $studentIds)
            ->select('student_id')
            ->selectRaw("COUNT(*) as total")
            ->groupBy('student_id')
            ->pluck('total', 'student_id');

        $studentList = $placements->map(function ($p) use ($attData, $journalData) {
            $att = $attData[$p->student_id] ?? null;
            $totalDays = max(1, $att->total ?? 0);
            $attCount = $att->hadir ?? 0;
            $attendancePercent = round(($attCount / $totalDays) * 100);
            $journalCount = $journalData[$p->student_id] ?? 0;

            return [
                'id' => $p->student->id,
                'placement_id' => $p->id,
                'name' => $p->student->user->name,
                'email' => $p->student->user->email ?? '-',
                'nis' => $p->student->nis ?? '-',
                'phone' => $p->student->phone ?? '-',
                'class' => $p->student->class,
                'major' => $p->student->major,
                'industry' => $p->company->name ?? ($p->industry->name ?? 'Perusahaan Mitra'),
                'attendance_percent' => $attendancePercent,
                'journal_filled' => $journalCount,
                'status' => ($attendancePercent < 80) ? 'Perlu Perhatian' : 'Aman',
                'placement_status' => $p->status,
                'start_date' => $p->start_date ? Carbon::parse($p->start_date)->format('Y-m-d') : '-',
                'end_date' => $p->end_date ? Carbon::parse($p->end_date)->format('Y-m-d') : '-',
            ];
        });

        $visits = Visit::with(['student.user:id,name', 'company:id,name'])
            ->where('teacher_id', $user->id)
            ->orderBy('visit_date', 'desc')
            ->get();

        return Inertia::render('Guru/Dashboard', [
            'supervisor' => $user->name,
            'students' => $studentList,
            'visits' => $visits,
            'stats' => [
                'total_supervised' => $studentList->count(),
                'attention_needed' => $studentList->where('status', 'Perlu Perhatian')->count(),
                'avg_attendance' => round($studentList->avg('attendance_percent') ?? 95) . '%',
            ]
        ]);
    }

    private function industriDashboard($user): Response
    {
        $placements = Placement::with(['student.user:id,name,email', 'student.assessment'])
            ->where('industry_supervisor_id', $user->id)
            ->get();

        // Batch-load pending journal counts — FIXES N+1
        $studentIds = $placements->pluck('student_id')->unique()->values();

        $pendingJournals = Journal::query()
            ->whereIn('student_id', $studentIds)
            ->where('status', 'Menunggu Approval')
            ->select('student_id')
            ->selectRaw("COUNT(*) as total")
            ->groupBy('student_id')
            ->pluck('total', 'student_id');

        $students = $placements->map(function ($p) use ($pendingJournals) {
            $jPending = $pendingJournals[$p->student_id] ?? 0;
            return [
                'id' => $p->student->id,
                'placement_id' => $p->id,
                'name' => $p->student->user->name,
                'nis' => $p->student->nis ?? '-',
                'email' => $p->student->user->email ?? '-',
                'phone' => $p->student->phone ?? '-',
                'class' => $p->student->class,
                'major' => $p->student->major,
                'status' => $p->status,
                'pending_journals' => $jPending,
                'has_assessment' => $p->student->assessment !== null,
                'score' => $p->student->assessment ? $p->student->assessment->total_score : null,
                'start_date' => $p->start_date ? Carbon::parse($p->start_date)->format('Y-m-d') : '-',
                'end_date' => $p->end_date ? Carbon::parse($p->end_date)->format('Y-m-d') : '-',
            ];
        });

        $pendingApprovals = Journal::with(['student.user:id,name'])
            ->whereIn('student_id', $studentIds)
            ->where('status', 'Menunggu Approval')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Industri/Dashboard', [
            'supervisor' => $user->name,
            'students' => $students,
            'pendingApprovals' => $pendingApprovals,
        ]);
    }

    private function siswaDashboard($user): Response
    {
        $student = Student::with(['placement.company:id,name', 'placement.schoolSupervisor:id,name', 'latestApplication'])->where('user_id', $user->id)->first();
        
        if (!$student) {
            return Inertia::render('Siswa/Dashboard', [
                'student' => null,
                'stats' => null,
            ]);
        }

        // Single query for attendance stats instead of 2 separate count queries
        $attStats = Attendance::where('student_id', $student->id)
            ->selectRaw("COUNT(*) as total")
            ->selectRaw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as present")
            ->first();

        $totalAtt = $attStats->total ?? 0;
        $presentAtt = $attStats->present ?? 0;
        $attPercent = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100) : null;

        $journalCount = Journal::where('student_id', $student->id)->count();

        $todayAtt = Attendance::where('student_id', $student->id)
            ->where('date', Carbon::today()->format('Y-m-d'))
            ->first();

        $placement = $student->placement;
        $daysCount = 0;
        if ($placement && $placement->status === 'Aktif' && $placement->start_date) {
            $startDate = Carbon::parse($placement->start_date)->startOfDay();
            $today = Carbon::today();
            if ($today->greaterThanOrEqualTo($startDate)) {
                $daysCount = $startDate->diffInWeekdays($today->addDay());
            }
        }

        return Inertia::render('Siswa/Dashboard', [
            'studentName' => $user->name,
            'student' => $student,
            'todayAttendance' => $todayAtt,
            'application' => $student->latestApplication,
            'stats' => [
                'status_pkl' => $placement ? $placement->status : 'Draft Pendaftaran',
                'attendance_percent' => $attPercent !== null ? $attPercent . '%' : '0%',
                'journal_filled' => "{$journalCount} / 25",
                'days_count' => $daysCount,
            ]
        ]);
    }
}
