<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Visit;
use App\Models\VisitReport;
use App\Models\Student;
use App\Models\Company;
use App\Models\Placement;
use App\Models\User;
use App\Models\Notification;
use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\DocumentVerification;
use Carbon\Carbon;
use Illuminate\Support\Str;

use App\Services\VisitNotificationService;

class VisitController extends Controller
{
    // List visits (Guru sees own visits, Admin sees all visits)
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Visit::with(['teacher', 'student.user', 'company', 'placement.company', 'report', 'document.verification']);

        if ($user->isGuru()) {
            $query->where('teacher_id', $user->id);
        }

        $visits = $query->orderBy('visit_date', 'desc')->get();

        // Students supervised by this teacher (for schedule form)
        $myStudents = Student::with(['user', 'placement.company'])
            ->whereHas('placement', function ($q) use ($user) {
                if ($user->isGuru()) {
                    $q->where('school_supervisor_id', $user->id);
                }
            })->get();

        if ($myStudents->isEmpty()) {
            $myStudents = Student::with(['user', 'placement.company'])
                ->whereHas('placement')
                ->get();
        }

        $companies = Company::all();
        $teachers = User::whereIn('role', ['guru', 'admin'])->get();

        return Inertia::render('Monitoring/VisitsIndex', [
            'visits' => $visits,
            'myStudents' => $myStudents,
            'companies' => $companies,
            'teachers' => $teachers,
        ]);
    }

    // Schedule new visit (Inertia form)
    public function store(Request $request, VisitNotificationService $notificationService)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'teacher_id' => 'nullable|exists:users,id',
            'visit_date' => 'required|date',
            'visit_time' => 'nullable|string',
            'purpose' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $visit = $this->createVisit($request->user(), $validated, $notificationService);

        return back()->with('success', "Jadwal kunjungan monitoring SMK Taruna Bangsa dan Surat Tugas resmi berhasil dibuat! Notifikasi Web, Email & WhatsApp telah terkirim.");
    }

    // POST /api/visits — used by NEXA AI confirmation flow (spec #17)
    public function storeApi(Request $request, VisitNotificationService $notificationService)
    {
        $user = $request->user();

        abort_unless($user->isGuru() || $user->isAdmin(), 403, 'Hanya Guru Pembimbing atau Admin Hubin yang dapat membuat jadwal kunjungan.');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'teacher_id' => 'nullable|exists:users,id',
            'visit_date' => 'required|date',
            'visit_time' => 'nullable|string',
            'purpose' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Authorization: guru may only schedule visits for their own students.
        if ($user->isGuru()) {
            $authorized = Placement::where('school_supervisor_id', $user->id)
                ->where('student_id', $validated['student_id'])
                ->exists();

            abort_unless($authorized, 403, 'Siswa ini bukan bagian dari bimbingan Anda.');
        }

        $visit = $this->createVisit($user, $validated, $notificationService);

        return response()->json([
            'status' => 'success',
            'message' => "Jadwal kunjungan untuk {$visit->student->user->name} berhasil dibuat. Notifikasi Web, Email & WhatsApp telah terkirim.",
            'visit' => [
                'id' => $visit->id,
                'student' => $visit->student->user->name ?? null,
                'company' => $visit->company->name ?? null,
                'visit_date' => $visit->visit_date,
                'status' => $visit->status,
            ],
        ], 201);
    }

    /**
     * Core visit creation shared by web + API entry points.
     * Auto-generates official Surat Tugas from document template
     * and sends multi-channel notifications (Web, Email, WhatsApp).
     */
    private function createVisit(User $user, array $validated, VisitNotificationService $notificationService): Visit
    {
        $student = Student::with(['placement.company', 'user'])->findOrFail($validated['student_id']);
        $companyId = $student->placement ? $student->placement->company_id : (Company::first()->id ?? null);

        // Determine assigned teacher: if provided, use it. If logged in as Guru, use $user->id. Otherwise fallback to placement supervisor or $user->id.
        $assignedTeacherId = !empty($validated['teacher_id']) 
            ? (int) $validated['teacher_id']
            : ($user->isGuru() ? $user->id : ($student->placement?->school_supervisor_id ?? $user->id));

        $assignedTeacher = User::find($assignedTeacherId) ?? $user;

        $visit = Visit::create([
            'teacher_id' => $assignedTeacherId,
            'student_id' => $student->id,
            'company_id' => $companyId,
            'placement_id' => $student->placement ? $student->placement->id : null,
            'visit_date' => $validated['visit_date'],
            'visit_time' => $validated['visit_time'] ?? '09:00 WIB',
            'purpose' => $validated['purpose'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'scheduled',
        ]);

        // Automatically generate official Surat Tugas document for this visit
        $template = DocumentTemplate::first();
        if ($template) {
            $docNum = 'ST/' . Carbon::now()->format('m/Y') . '/PKL-SMK1/' . sprintf('%03d', rand(1, 999));
            $doc = Document::create([
                'template_id' => $template->id,
                'visit_id' => $visit->id,
                'title' => "Surat Tugas Monitoring PKL - {$assignedTeacher->name}",
                'type' => 'surat_tugas',
                'document_number' => $docNum,
                'data' => [
                    'nomor_surat' => $docNum,
                    'nama_guru' => $assignedTeacher->name,
                    'nip' => '19780512 200501 1 004',
                    'nama_siswa' => $student->user->name ?? 'Siswa',
                    'nis' => $student->nis,
                    'kelas' => $student->class,
                    'nama_industri' => $student->placement->company->name ?? 'Perusahaan Mitra',
                    'alamat_industri' => $student->placement->company->address ?? 'Alamat Industri',
                    'tanggal_kunjungan' => Carbon::parse($validated['visit_date'])->translatedFormat('d F Y'),
                    'tujuan' => $validated['purpose'],
                ],
                'status' => 'final',
                'created_by' => $user->id,
            ]);

            // Register QR Code Document Verification identity for the generated letter
            do {
                $token = 'PKL-' . Str::upper(Str::random(12));
            } while (DocumentVerification::where('verification_token', $token)->exists());

            $verificationCode = 'PKL-' . Carbon::now()->format('Y') . '-082-' . str_pad((string) $doc->id, 3, '0', STR_PAD_LEFT);

            DocumentVerification::create([
                'document_id' => $doc->id,
                'verification_code' => $verificationCode,
                'verification_token' => $token,
                'document_type' => $doc->type,
                'document_number' => $docNum,
                'status' => 'VALID',
            ]);

            $doc->update([
                'data' => array_merge($doc->data, ['verification_id' => $verificationCode]),
            ]);
        }

        // DISPATCH MULTI-CHANNEL NOTIFICATIONS (Web, Email, WhatsApp)
        $notificationService->notifyVisitScheduled($visit);

        return $visit;
    }

    // Save Visit Report (Laporan Kunjungan)
    public function storeReport(Request $request, $id, VisitNotificationService $notificationService)
    {
        $visit = Visit::findOrFail($id);

        $validated = $request->validate([
            'student_condition' => 'required|string',
            'attendance_status' => 'required|string',
            'progress_notes' => 'required|string',
            'obstacles' => 'nullable|string',
            'industry_feedback' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);

        VisitReport::updateOrCreate(
            ['visit_id' => $visit->id],
            [
                'student_condition' => $validated['student_condition'],
                'attendance_status' => $validated['attendance_status'],
                'progress_notes' => $validated['progress_notes'],
                'obstacles' => $validated['obstacles'] ?? null,
                'industry_feedback' => $validated['industry_feedback'] ?? null,
                'recommendations' => $validated['recommendations'] ?? null,
                'photos' => ['documentation/visit_report_photo.jpg'],
            ]
        );

        $visit->update(['status' => 'completed']);

        $notificationService->notifyReportCompleted($visit);

        return back()->with('success', 'Laporan hasil kunjungan monitoring berhasil disimpan & notifikasi telah dikirim!');
    }
}
