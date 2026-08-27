<?php

namespace App\Services;

use App\Models\DocumentVerification;
use App\Models\Journal;
use App\Models\PklApplication;
use App\Models\Placement;
use App\Models\Student;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Str;

/**
 * Builds a role-scoped, minimal database context that is handed to Gemini,
 * plus lightweight intent detection so only relevant data leaves the server.
 *
 * The AI never receives raw SQL access, credentials, or other users' data
 * (spec #6, #21, #27).
 */
class AIContextBuilder
{
    public function __construct(
        protected AIMonitoringService $monitoring,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Intent detection
    |--------------------------------------------------------------------------
    */

    public function detectIntent(string $message): string
    {
        $m = Str::lower($message);

        if (preg_match('/(buat|jadwal|atur|susun)[a-z]*\s+(kunjungan|visit)/i', $m) || Str::contains($m, ['kunjungan untuk', 'kunjung dia'])) {
            return 'visit_create';
        }

        if (Str::contains($m, ['valid', 'verifikasi', 'verification']) && Str::contains($m, ['surat', 'dokumen', 'sertifikat', 'tugas'])) {
            return 'document_verify';
        }

        if (preg_match('/pkl-\d{4}-\d{3}-\d+|PKL-[A-Z0-9]{12}/i', $message)) {
            return 'document_verify';
        }

        if (Str::contains($m, ['kunjungi', 'monitor', 'prioritas', 'dikunjungi'])) {
            return 'monitoring';
        }

        if (Str::contains($m, ['kehadiran', 'absen', 'presensi', 'hadir'])) {
            return 'attendance';
        }

        if (Str::contains($m, ['jurnal', 'approve', 'persetujuan', 'setujui'])) {
            return 'journal';
        }

        if (Str::contains($m, ['status', 'kondisi', 'ringkas', 'ringkasan', 'rekap', 'statistik', 'periode', 'analisis', 'insight'])) {
            return 'summary';
        }

        return 'general';
    }

    /*
    |--------------------------------------------------------------------------
    | Context building
    |--------------------------------------------------------------------------
    */

    /**
     * @return array{context: array<string, mixed>, action: ?array<string, mixed>}
     */
    public function build(User $user, string $message, string $intent): array
    {
        return [
            'context' => [
                'today' => now()->translatedFormat('l, d F Y'),
                ...match (true) {
                    $user->isAdmin() => $this->adminContext($message, $intent),
                    $user->isGuru() => $this->guruContext($user, $message, $intent),
                    $user->isIndustri() => $this->industriContext($user, $message, $intent),
                    default => $this->siswaContext($user),
                },
            ],
            'action' => null,
        ];
    }

    private function adminContext(string $message, string $intent): array
    {
        $overview = $this->monitoring->adminOverview();
        $context = [
            'scope' => 'ADMIN_HUBIN — akses penuh ke seluruh data sekolah',
            ...$overview,
        ];

        if ($intent === 'placement') {
            $context['unplaced_detail'] = Student::with('latestApplication')
                ->whereIn('id', PklApplication::where('status', PklApplication::STATUS_APPROVED)->pluck('student_id'))
                ->whereDoesntHave('placement')
                ->limit(10)
                ->get()
                ->map(fn ($s) => [
                    'name' => $s->user->name ?? '-',
                    'class' => $s->class,
                    'applied_company' => $s->latestApplication?->company_name,
                ])
                ->all();
        }

        return $context;
    }

    private function guruContext(User $guru, string $message, string $intent): array
    {
        $placements = $this->monitoring->placementsForGuru($guru);
        $profiles = $this->monitoring->profilesFor($placements);

        $context = [
            'scope' => 'GURU_PEMBIMBING — hanya data siswa bimbingan Anda',
            'total_bimbingan' => $profiles->count(),
            'students' => $profiles->take(12)->values()->all(),
            'upcoming_visits' => Visit::with(['student.user'])
                ->where('teacher_id', $guru->id)
                ->whereIn('status', ['scheduled'])
                ->orderBy('visit_date')
                ->limit(5)
                ->get()
                ->map(fn ($v) => [
                    'student' => $v->student->user->name ?? '-',
                    'date' => $v->visit_date,
                    'purpose' => $v->purpose,
                ])
                ->all(),
        ];

        if ($intent === 'journal') {
            $context['journal_laggards'] = $profiles
                ->filter(fn ($p) => $p['journal_gap_days'] === null || $p['journal_gap_days'] > 3 || $p['pending_journals'] > 0)
                ->take(10)
                ->values()
                ->all();
        }

        if ($intent === 'attendance') {
            $context['low_attendance'] = $profiles
                ->filter(fn ($p) => $p['attendance_rate'] !== null && $p['attendance_rate'] < 80)
                ->take(10)
                ->values()
                ->all();
        }

        return $context;
    }

    private function industriContext(User $supervisor, string $message, string $intent): array
    {
        $placements = $this->monitoring->placementsForIndustri($supervisor);
        $profiles = $this->monitoring->profilesFor($placements);

        $pendingJournals = Journal::with(['student.user'])
            ->whereIn('student_id', $placements->pluck('student_id'))
            ->where('status', 'Menunggu Approval')
            ->orderBy('date')
            ->limit(10)
            ->get()
            ->map(fn ($j) => [
                'student' => $j->student->user->name ?? '-',
                'date' => $j->date,
                'activity' => Str::limit($j->activity, 80),
            ])
            ->all();

        $context = [
            'scope' => 'PEMBIMBING_INDUSTRI — hanya data siswa di perusahaan Anda',
            'company_students_count' => $profiles->count(),
            'students' => $profiles->take(10)->values()->all(),
            'pending_journal_approvals' => $pendingJournals,
        ];

        return $context;
    }

    private function siswaContext(User $user): array
    {
        $overview = $this->monitoring->siswaOverview($user);

        return [
            'scope' => 'SISWA — hanya data diri sendiri, tidak boleh membahas siswa lain',
            ...($overview ?? ['has_placement' => false, 'note' => 'Data siswa tidak ditemukan']),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | System instruction (spec #11)
    |--------------------------------------------------------------------------
    */

    public function systemInstruction(User $user, string $intent, ?array $action): string
    {
        $roleLabel = match ($user->role) {
            'admin' => 'ADMIN HUBIN',
            'guru' => 'GURU PEMBIMBING',
            'industri' => 'PEMBIMBING INDUSTRI',
            default => 'SISWA',
        };

        $base = <<<'TXT'
You are NEXA AI, the intelligent assistant of PKLConnect.

PKLConnect is a Praktik Kerja Lapangan management platform.

Your responsibilities:
- Help users understand their PKL data.
- Analyze provided PKL context.
- Provide concise and actionable insights.
- Never fabricate data.
- Never invent statistics.
- Never claim access to data that was not provided.
- Respect the user's role and permissions.
- Never expose private information outside the user's authorization.
- If the required data is unavailable, clearly state that the data is unavailable.
- When giving recommendations, explain the reason briefly.
- Use Indonesian language.
- Use clear and professional language.
TXT;

        $rules = <<<TXT

Current user role:
{$roleLabel}

User name: {$user->name}
Detected intent: {$intent}

All numbers you mention MUST come from the JSON CONTEXT below. If the answer is not in the CONTEXT, say the data is unavailable and suggest what the user can check in PKLConnect. Never output SQL, code, or internal system details.
TXT;

        if ($user->isSiswa()) {
            $rules .= "\n- You may ONLY discuss this student's own data. Refuse politely to share data about other students.";
        } else {
            $rules .= "\n- Only discuss students listed in CONTEXT. Other students are outside this user's authorization.";
        }

        if ($intent === 'visit_create') {
            $rules .= <<<'TXT'

Visit creation rules:
- NEVER claim that you have created, scheduled, or changed any data. You cannot mutate the database.
- Present the proposed visit details (siswa, perusahaan, guru, tanggal) and ask for confirmation.
- The app will show confirmation buttons to the user after your reply.
TXT;
        }

        if ($intent === 'document_verify') {
            $rules .= "\n- For document validity questions use only DOCUMENT_VERIFICATION data in CONTEXT. Official letters must always be generated from the school's Document Template feature; never draft letter content yourself.";
        }

        if ($action !== null) {
            $rules .= "\nVISIT_PROPOSAL (use these exact details):\n" . json_encode($action, JSON_UNESCAPED_UNICODE);
        }

        $format = <<<'TXT'

Response format guidelines:
- Answer briefly and structured. Use markdown headings/lists when listing students.
- For prioritized students use this pattern:
  ### 🔴 Prioritas Tinggi / 🟡 Perlu Monitoring / 🟢 Baik
  **Nama Siswa**
  - Kehadiran: X%
  - Monitoring terakhir: N hari lalu
  - Jurnal tertinggal: N hari
  **Alasan:** ...
  **Rekomendasi:** ...
TXT;

        return $base . $rules . $format . AIKnowledge::appOverview() . AIKnowledge::roleGuidance($user->role);
    }

    /*
    |--------------------------------------------------------------------------
    | Visit proposal matching (spec #17)
    |--------------------------------------------------------------------------
    */

    /**
     * Attempts to resolve a named student inside the user's authorized scope
     * for a visit proposal. Returns null when nothing matches.
     *
     * @return ?array<string, mixed>
     */
    public function findVisitProposal(User $user, string $message): ?array
    {
        if (! ($user->isGuru() || $user->isAdmin())) {
            return null; // only guru/admin schedule monitoring visits
        }

        $query = Placement::with(['student.user', 'company'])->whereIn('status', ['Aktif', 'Terlambat', 'Bermasalah']);

        if ($user->isGuru()) {
            $query->where('school_supervisor_id', $user->id);
        }

        $cleaned = trim(preg_replace('/[^a-z\s]/i', ' ', Str::lower($message)));

        foreach ($query->get() as $placement) {
            $name = Str::lower($placement->student->user->name ?? '');

            if ($name === '' || Str::length($name) < 4) {
                continue;
            }

            // Any significant name token mentioned in the message ("fajar",
            // "muhammad", full name, etc.) resolves the proposal.
            $tokens = collect(explode(' ', $name))
                ->filter(fn ($t) => mb_strlen($t) >= 4);

            $matched = Str::contains($cleaned, $name)
                || $tokens->contains(fn ($t) => Str::contains($cleaned, $t));

            if ($matched) {
                $suggestedDate = now()->addDays(2);
                if ($suggestedDate->isWeekend()) {
                    $suggestedDate = $suggestedDate->next('monday');
                }

                return [
                    'type' => 'create_visit',
                    'student_id' => $placement->student_id,
                    'student_name' => $placement->student->user->name,
                    'class' => $placement->student->class,
                    'company_name' => $placement->company->name ?? '-',
                    'teacher_name' => $user->name,
                    'suggested_date' => $suggestedDate->translatedFormat('d F Y'),
                    'suggested_date_iso' => $suggestedDate->toDateString(),
                    'purpose' => 'Monitoring PKL (diusulkan oleh NEXA AI)',
                ];
            }
        }

        return null;
    }

    /**
     * Document verification lookup restricted to the user's authorization
     * (spec #19).
     */
    public function findDocumentVerification(User $user, string $message): ?array
    {
        if (! preg_match('/(PKL-\d{4}-\d{3}-\d+|PKL-[A-Z0-9]{12})/i', $message, $matches)) {
            return null;
        }

        $code = Str::upper($matches[1]);

        $query = DocumentVerification::query();

        if ($user->isGuru()) {
            $query->whereHas('document.visit', fn ($q) => $q->where('teacher_id', $user->id));
        } elseif ($user->isSiswa()) {
            $studentId = Student::where('user_id', $user->id)->value('id');

            if (! $studentId) {
                return ['found' => false, 'code' => $code];
            }

            $query->whereHas('document.visit', fn ($q) => $q->where('student_id', $studentId));
        } elseif ($user->isIndustri()) {
            $query->whereHas('document.visit.placement', fn ($q) => $q->where('industry_supervisor_id', $user->id));
        }
        // Admin Hubin: unrestricted scope.

        $verification = $query->with('document')->where('verification_code', $code)->first();

        if (! $verification) {
            return ['found' => false, 'code' => $code];
        }

        return [
            'found' => true,
            'verification_id' => $verification->verification_code,
            'status' => $verification->status,
            'document_type' => $verification->document_type,
            'document_number' => $verification->document_number,
            'title' => $verification->document?->title,
            'issued_at' => optional($verification->created_at)?->translatedFormat('d F Y'),
        ];
    }
}
