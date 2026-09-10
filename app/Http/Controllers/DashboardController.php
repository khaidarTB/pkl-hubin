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
        $totalStudents = Student::count();
        $pendingApplications = PklApplication::where('status', PklApplication::STATUS_SUBMITTED)->count();
        
        $approvedApplications = PklApplication::where('status', PklApplication::STATUS_APPROVED)->pluck('student_id');
        $unplacedStudents = Student::whereIn('id', $approvedApplications)->whereDoesntHave('placement')->count();

        $activeStudents = Placement::where('status', 'Aktif')->count();
        $troubleStudents = Placement::where('status', 'Bermasalah')->count();
        $completedStudents = Placement::where('status', 'Selesai')->count();

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
        }])->get()->map(function ($c) {
            return ['name' => $c->name, 'students' => $c->placements_count];
        });

        // Monitoring Student Table
        $placements = Placement::with(['student.user', 'company', 'industry', 'schoolSupervisor'])->get()->map(function ($p) {
            $attCount = Attendance::where('student_id', $p->student_id)->where('status', 'Hadir')->count();
            $totalDays = max(1, Attendance::where('student_id', $p->student_id)->count());
            $attendancePercent = round(($attCount / $totalDays) * 100);
            
            $journalCount = Journal::where('student_id', $p->student_id)->count();

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
        $placements = Placement::with(['student.user', 'company', 'industry'])
            ->where('school_supervisor_id', $user->id)
            ->get();

        $studentList = $placements->map(function ($p) {
            $attCount = Attendance::where('student_id', $p->student_id)->where('status', 'Hadir')->count();
            $totalDays = max(1, Attendance::where('student_id', $p->student_id)->count());
            $attendancePercent = round(($attCount / $totalDays) * 100);
            $journalCount = Journal::where('student_id', $p->student_id)->count();

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

        $visits = Visit::with(['student.user', 'company'])
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
        $placements = Placement::with(['student.user', 'student.journals', 'student.assessment'])
            ->where('industry_supervisor_id', $user->id)
            ->get();

        $students = $placements->map(function ($p) {
            $jPending = Journal::where('student_id', $p->student_id)->where('status', 'Menunggu Approval')->count();
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

        $pendingApprovals = Journal::with(['student.user'])
            ->whereIn('student_id', $placements->pluck('student_id'))
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
        $student = Student::with(['placement.company', 'placement.schoolSupervisor', 'latestApplication'])->where('user_id', $user->id)->first();
        
        if (!$student) {
            return Inertia::render('Siswa/Dashboard', [
                'student' => null,
                'stats' => null,
            ]);
        }

        $totalAtt = Attendance::where('student_id', $student->id)->count();
        $presentAtt = Attendance::where('student_id', $student->id)->where('status', 'Hadir')->count();
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
