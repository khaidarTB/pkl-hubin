<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Journal;
use App\Models\PklApplication;
use App\Models\Placement;
use App\Models\Student;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Computes monitoring intelligence from the database BEFORE any data is
 * sent to Gemini. The AI never queries the database itself — it only
 * receives these pre-computed, role-scoped, minimal facts.
 */
class AIMonitoringService
{
    public function __construct(
        protected int $maxStudentsInContext = 12,
        protected int $maxItemsInInsight = 8,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Monitoring Score (spec #12)
    |--------------------------------------------------------------------------
    */

    /**
     * Attendance risk points.
     */
    public function attendanceRisk(?float $rate): int
    {
        if ($rate === null) {
            return 0; // no data — flagged separately
        }

        return match (true) {
            $rate < 70 => 40,
            $rate < 80 => 25,
            $rate < 90 => 10,
            default => 0,
        };
    }

    /**
     * Days-since-last-visit risk points.
     */
    public function visitRisk(?int $daysSinceVisit, ?Carbon $startedAt): int
    {
        if ($daysSinceVisit === null) {
            // Never visited: only a concern if placement has been running a while.
            if ($startedAt !== null && $startedAt->diffInDays(now()) > 14) {
                return 30;
            }

            return 0;
        }

        return match (true) {
            $daysSinceVisit > 14 => 30,
            $daysSinceVisit >= 7 => 15,
            default => 0,
        };
    }

    /**
     * Journal-gap risk points.
     */
    public function journalRisk(?int $gapDays): int
    {
        if ($gapDays === null) {
            return 20; // never wrote a journal
        }

        return match (true) {
            $gapDays > 3 => 20,
            $gapDays >= 1 => 10,
            default => 0,
        };
    }

    /**
     * Industry-feedback / status problem risk points.
     */
    public function problemRisk(Placement $placement): int
    {
        return $placement->status === 'Bermasalah' ? 30 : 0;
    }

    /**
     * @return array{score: int, level: string}
     */
    public function score(array $factors): array
    {
        $total = $factors['attendance_risk']
            + $factors['visit_risk']
            + $factors['journal_risk']
            + $factors['problem_risk'];

        return [
            'score' => $total,
            'level' => match (true) {
                $total >= 70 => 'CRITICAL',
                $total >= 40 => 'HIGH',
                $total >= 20 => 'MEDIUM',
                default => 'LOW',
            },
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Per-student metrics
    |--------------------------------------------------------------------------
    */

    public function attendanceRate(Student $student): ?float
    {
        $total = Attendance::where('student_id', $student->id)->count();

        if ($total === 0) {
            return null;
        }

        $present = Attendance::where('student_id', $student->id)->where('status', 'Hadir')->count();

        return round(($present / $total) * 100, 1);
    }

    public function daysSinceLastVisit(int $studentId, ?string $notBefore = null): ?int
    {
        // Only past/completed visits count as "last visited"; an upcoming
        // scheduled visit must never produce negative or misleading gaps.
        // Visits dated before the placement started are data noise — ignored.
        $query = Visit::where('student_id', $studentId)
            ->whereNotNull('visit_date')
            ->whereDate('visit_date', '<=', now()->toDateString());

        if ($notBefore !== null) {
            $query->whereDate('visit_date', '>=', $notBefore);
        }

        $lastDate = (clone $query)->max('visit_date');

        if ($lastDate === null) {
            return null;
        }

        return (int) Carbon::parse($lastDate)->startOfDay()->diffInDays(now()->startOfDay());
    }

    public function journalGapDays(int $studentId): ?int
    {
        $lastDate = Journal::where('student_id', $studentId)->max('date');

        if ($lastDate === null) {
            return null;
        }

        return (int) Carbon::parse($lastDate)->startOfDay()->diffInDays(now()->startOfDay());
    }

    public function pendingJournalsCount(int $studentId): int
    {
        return Journal::where('student_id', $studentId)->where('status', 'Menunggu Approval')->count();
    }

    /**
     * Full monitoring profile for one placement. Minimal PII:
     * name/class/company + metrics only. No contact details.
     *
     * @return array<string, mixed>
     */
    public function studentProfile(Placement $placement): array
    {
        $student = $placement->student;

        $rate = $this->attendanceRate($student);
        $daysSinceVisit = $this->daysSinceLastVisit($student->id, $placement->start_date);
        $journalGap = $this->journalGapDays($student->id);

        $factors = [
            'attendance_rate' => $rate,
            'attendance_risk' => $this->attendanceRisk($rate),
            'days_since_last_visit' => $daysSinceVisit,
            'visit_risk' => $this->visitRisk($daysSinceVisit, $placement->placed_at ?? ($placement->start_date ? Carbon::parse($placement->start_date) : null)),
            'journal_gap_days' => $journalGap,
            'pending_journals' => $this->pendingJournalsCount($student->id),
            'journal_risk' => $this->journalRisk($journalGap),
            'problem_risk' => $this->problemRisk($placement),
        ];

        $scored = $this->score($factors);

        return [
            'student_id' => $student->id,
            'name' => $student->user->name ?? '-',
            'class' => $student->class,
            'company' => $placement->company->name ?? '-',
            'placement_status' => $placement->status,
            'start_date' => $placement->start_date,
            'end_date' => $placement->end_date,
            ...$factors,
            ...$scored,
        ];
    }

    /**
     * @param  Collection<int, Placement>  $placements
     * @return Collection<int, array<string, mixed>>
     */
    public function profilesFor(Collection $placements): Collection
    {
        return $placements
            ->map(fn (Placement $p) => $this->studentProfile($p))
            ->sortByDesc('score')
            ->values();
    }

    /*
    |--------------------------------------------------------------------------
    | Role-scoped data access (spec #7-#10)
    |--------------------------------------------------------------------------
    */

    /** Students supervised by this teacher only. */
    public function placementsForGuru(User $guru): Collection
    {
        return Placement::with(['student.user', 'company'])
            ->where('school_supervisor_id', $guru->id)
            ->whereIn('status', ['Aktif', 'Terlambat', 'Bermasalah'])
            ->orderBy('start_date')
            ->get();
    }

    /** Students placed at the industry supervisor's company only. */
    public function placementsForIndustri(User $supervisor): Collection
    {
        return Placement::with(['student.user', 'company'])
            ->where('industry_supervisor_id', $supervisor->id)
            ->whereIn('status', ['Aktif', 'Terlambat', 'Bermasalah'])
            ->orderBy('start_date')
            ->get();
    }

    /** Global overview for Admin Hubin. */
    public function adminOverview(): array
    {
        $approvedAppStudentIds = PklApplication::where('status', PklApplication::STATUS_APPROVED)->pluck('student_id');

        $activePlacements = Placement::with(['student.user', 'company'])->whereIn('status', ['Aktif', 'Terlambat'])->get();
        $problemPlacements = Placement::with(['student.user', 'company'])->where('status', 'Bermasalah')->get();

        $profiles = $this->profilesFor($activePlacements->merge($problemPlacements));

        $lowAttendance = $profiles->filter(fn ($p) => $p['attendance_rate'] !== null && $p['attendance_rate'] < 80);
        $staleVisits = $profiles->filter(function ($p) {
            $d = $p['days_since_last_visit'];

            return $d === null ? $p['placement_status'] !== '' : $d > 14;
        });
        $journalLaggards = $profiles->filter(fn ($p) => $p['journal_gap_days'] === null || $p['journal_gap_days'] > 3);

        // Companies with the most problematic students.
        $companiesWithProblems = Placement::with('company')
            ->where('status', 'Bermasalah')
            ->get()
            ->groupBy(fn ($p) => $p->company->name ?? '-')
            ->map(fn ($group, $companyName) => ['company' => $companyName, 'problem_students' => $group->count()])
            ->sortByDesc('problem_students')
            ->take(5)
            ->values()
            ->all();

        $avgAttendance = $profiles->filter(fn ($p) => $p['attendance_rate'] !== null)->avg('attendance_rate');

        return [
            'total_students' => Student::count(),
            'active_placements' => Placement::where('status', 'Aktif')->count(),
            'problem_placements' => $problemPlacements->count(),
            'completed_placements' => Placement::where('status', 'Selesai')->count(),
            'pending_applications' => PklApplication::where('status', PklApplication::STATUS_SUBMITTED)->count(),
            'unplaced_approved_students' => Student::whereIn('id', $approvedAppStudentIds)->whereDoesntHave('placement')->count(),
            'average_attendance' => $avgAttendance !== null ? round($avgAttendance, 1) : null,
            'low_attendance_count' => $lowAttendance->count(),
            'stale_visit_count' => $staleVisits->count(),
            'journal_laggard_count' => $journalLaggards->count(),
            'priority_students' => $this->limit($profiles),
            'companies_with_problems' => $companiesWithProblems,
        ];
    }

    /** Own data only for students (spec #10). */
    public function siswaOverview(User $user): ?array
    {
        $student = Student::with(['user'])->where('user_id', $user->id)->first();

        if (! $student) {
            return null;
        }

        $placement = Placement::with(['company', 'schoolSupervisor', 'industrySupervisor'])
            ->where('student_id', $student->id)
            ->latest('start_date')
            ->first();

        $journalsTotal = Journal::where('student_id', $student->id)->count();
        $journalsApproved = Journal::where('student_id', $student->id)->where('status', 'Approved')->count();
        $journalsPendingTitles = Journal::where('student_id', $student->id)
            ->where('status', 'Menunggu Approval')
            ->latest('date')
            ->limit(5)
            ->pluck('activity')
            ->all();

        $applicationStatus = $student->latestApplication?->only(['status', 'company_name']) ?: null;

        if (! $placement) {
            return [
                'student_name' => $user->name,
                'nis' => $student->nis,
                'class' => $student->class,
                'major' => $student->major,
                'has_placement' => false,
                'latest_application_status' => $applicationStatus['status'] ?? null,
                'applied_company' => $applicationStatus['company_name'] ?? null,
            ];
        }

        $rate = $this->attendanceRate($student);
        $gap = $this->journalGapDays($student->id);
        $profile = $this->studentProfile($placement);

        return [
            'student_name' => $user->name,
            'nis' => $student->nis,
            'class' => $student->class,
            'major' => $student->major,
            'has_placement' => true,
            'company' => $placement->company->name,
            'school_supervisor' => $placement->schoolSupervisor?->name,
            'industry_supervisor' => $placement->industrySupervisor?->name,
            'period_start' => $placement->start_date,
            'period_end' => $placement->end_date,
            'placement_status' => $placement->status,
            'attendance_rate' => $rate,
            'journal_total' => $journalsTotal,
            'journal_approved' => $journalsApproved,
            'pending_journal_titles' => $journalsPendingTitles,
            'journal_gap_days' => $gap,
            'days_since_last_visit' => $profile['days_since_last_visit'],
            'monitoring_level' => $profile['level'],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Insights (spec #13) — deterministic numbers, no fabrication possible
    |--------------------------------------------------------------------------
    */

    public function insightsForUser(User $user): array
    {
        $scopeLabel = match (true) {
            $user->isAdmin() => 'Seluruh sekolah',
            $user->isGuru() => "Siswa bimbingan {$user->name}",
            $user->isIndustri() => "Siswa di perusahaan {$user->name}",
            default => 'Data diri sendiri',
        };

        if ($user->isSiswa()) {
            $me = $this->siswaOverview($user);

            return [
                'scope' => $scopeLabel,
                'generated_at' => now()->toIso8601String(),
                'stats' => [],
                'insights' => $me ? [[
                    'key' => 'personal',
                    'title' => 'Status PKL Saya',
                    'count' => null,
                    'description' => sprintf(
                        'Status PKL kamu %s dengan kehadiran %s dan jurnal terisi %s hari lalu.',
                        strtolower((string) ($me['placement_status'] ?? 'belum ditempatkan')),
                        isset($me['attendance_rate']) ? $me['attendance_rate'].'%' : 'belum ada data',
                        isset($me['journal_gap_days']) ? $me['journal_gap_days'].' hari' : '-'
                    ),
                ]] : [],
                'priority_students' => [],
                'recommendation' => 'Tetap disiplin mengisi jurnal harian dan melakukan absensi check-in setiap hari.',
            ];
        }

        $placements = match (true) {
            $user->isAdmin() => Placement::with(['student.user', 'company'])->whereIn('status', ['Aktif', 'Terlambat', 'Bermasalah'])->get(),
            $user->isGuru() => $this->placementsForGuru($user),
            default => $this->placementsForIndustri($user),
        };

        $profiles = $this->profilesFor($placements);

        $lowAttendance = $profiles->filter(fn ($p) => $p['attendance_rate'] !== null && $p['attendance_rate'] < 80);
        $noRecentVisit = $profiles->filter(fn ($p) => $p['days_since_last_visit'] === null || $p['days_since_last_visit'] > 14);
        $journalGap = $profiles->filter(fn ($p) => $p['journal_gap_days'] === null || $p['journal_gap_days'] > 3);
        $unplaced = $user->isAdmin()
            ? Student::whereIn('id', PklApplication::where('status', PklApplication::STATUS_APPROVED)->pluck('student_id'))
                ->whereDoesntHave('placement')->count()
            : 0;

        $insights = [
            [
                'key' => 'attendance',
                'title' => 'Kehadiran Rendah',
                'count' => $lowAttendance->count(),
                'description' => "{$lowAttendance->count()} siswa memiliki kehadiran di bawah 80%.",
                'items' => $this->names($lowAttendance),
            ],
            [
                'key' => 'monitoring',
                'title' => 'Kunjungan Tertunda',
                'count' => $noRecentVisit->count(),
                'description' => "{$noRecentVisit->count()} siswa belum mendapatkan kunjungan selama lebih dari 14 hari.",
                'items' => $this->names($noRecentVisit),
            ],
            [
                'key' => 'journal',
                'title' => 'Jurnal Tertinggal',
                'count' => $journalGap->count(),
                'description' => "{$journalGap->count()} siswa belum mengisi jurnal selama lebih dari 3 hari.",
                'items' => $this->names($journalGap),
            ],
        ];

        if ($user->isAdmin()) {
            $insights[] = [
                'key' => 'placement',
                'title' => 'Belum Ditempatkan',
                'count' => $unplaced,
                'description' => "{$unplaced} siswa telah disetujui pengajuannya tetapi belum ditempatkan.",
                'items' => [],
            ];
        }

        $topPriority = $profiles->filter(fn ($p) => in_array($p['level'], ['HIGH', 'CRITICAL']))->take(5);

        $recommendation = $this->buildRecommendation($lowAttendance, $noRecentVisit, $journalGap, $topPriority);

        return [
            'scope' => $scopeLabel,
            'generated_at' => now()->toIso8601String(),
            'stats' => [
                'monitored_placements' => $profiles->count(),
                'critical_count' => $profiles->where('level', 'CRITICAL')->count(),
                'high_count' => $profiles->where('level', 'HIGH')->count(),
                'medium_count' => $profiles->where('level', 'MEDIUM')->count(),
                'low_count' => $profiles->where('level', 'LOW')->count(),
            ],
            'insights' => $insights,
            'priority_students' => $topPriority->values()->all(),
            'recommendation' => $recommendation,
        ];
    }

    private function buildRecommendation(Collection $lowAttendance, Collection $noRecentVisit, Collection $journalGap, Collection $topPriority): string
    {
        if ($topPriority->isNotEmpty()) {
            $worst = $topPriority->first();

            return sprintf(
                'Prioritaskan kunjungan kepada %s (skor risiko %d, kehadiran %s). Kombinasi kehadiran rendah dan kunjungan yang sudah lama tidak dilakukan adalah faktor risiko tertinggi.',
                $worst['name'],
                $worst['score'],
                $worst['attendance_rate'] !== null ? $worst['attendance_rate'].'%' : 'tanpa data',
            );
        }

        if ($noRecentVisit->isNotEmpty()) {
            return 'Prioritaskan kunjungan kepada siswa yang belum dikunjungi lebih dari 14 hari untuk memastikan kondisi PKL mereka.';
        }

        if ($journalGap->isNotEmpty()) {
            return 'Ingatkan siswa yang belum mengisi jurnal lebih dari 3 hari agar kelengkapan dokumentasi PKL tetap terjaga.';
        }

        if ($lowAttendance->isNotEmpty()) {
            return 'Koordinasikan dengan pembimbing industri terkait siswa yang tingkat kehadirannya di bawah 80%.';
        }

        return 'Semua siswa dalam lingkup Anda berada pada tingkat risiko rendah. Pertahankan ritme monitoring rutin.';
    }

    private function limit(Collection $profiles): array
    {
        return $profiles->take($this->maxStudentsInContext)->values()->all();
    }

    private function names(Collection $profiles): array
    {
        return $profiles->take($this->maxItemsInInsight)->pluck('name')->all();
    }
}
