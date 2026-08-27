<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\PklApplication;
use App\Models\Student;
use App\Models\Company;
use App\Models\PklPeriod;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class PklApplicationController extends Controller
{
    // Siswa: Pendaftaran PKL form / view
    public function pendaftaran(Request $request): Response
    {
        $user = $request->user();
        $student = Student::with(['latestApplication.company', 'placement.company'])->where('user_id', $user->id)->first();

        $companies = Company::where('partnership_status', 'active')->get();
        $activePeriod = PklPeriod::where('status', 'active')->first();

        return Inertia::render('Siswa/PklApplication', [
            'student' => $student,
            'companies' => $companies,
            'activePeriod' => $activePeriod,
            'application' => $student ? $student->latestApplication : null,
        ]);
    }

    // Siswa: Submit PKL Application
    public function store(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'company_name' => 'required|string|max:255',
            'company_address' => 'required|string',
            'field_of_work' => 'required|string|max:255',
            'desired_position' => 'required|string|max:255',
            'cv_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'cover_letter_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $cvPath = null;
        if ($request->hasFile('cv_file')) {
            $cvPath = $request->file('cv_file')->store('documents', 'public');
        }

        $coverPath = null;
        if ($request->hasFile('cover_letter_file')) {
            $coverPath = $request->file('cover_letter_file')->store('documents', 'public');
        }

        $activePeriod = PklPeriod::where('status', 'active')->first();

        $application = PklApplication::create([
            'student_id' => $student->id,
            'company_id' => $validated['company_id'] ?? null,
            'pkl_period_id' => $activePeriod ? $activePeriod->id : null,
            'company_name' => $validated['company_name'],
            'company_address' => $validated['company_address'],
            'field_of_work' => $validated['field_of_work'],
            'desired_position' => $validated['desired_position'],
            'cv_file' => $cvPath ?? 'documents/sample_cv.pdf',
            'cover_letter_file' => $coverPath ?? 'documents/sample_cover.pdf',
            'status' => PklApplication::STATUS_SUBMITTED,
            'submitted_at' => Carbon::now(),
        ]);

        // Notify admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => '🔔 Pengajuan PKL Baru',
                'message' => "Pengajuan PKL baru dari {$user->name} ({$student->class}) ke {$validated['company_name']}.",
                'type' => 'warning',
                'icon' => 'FileText',
                'link' => '/admin/pengajuan',
            ]);
        }

        return redirect()->route('pkl.status')->with('success', 'Pengajuan PKL berhasil dikirim! Menunggu verifikasi Hubin.');
    }

    // Siswa: Status Timeline View
    public function status(Request $request): Response
    {
        $user = $request->user();
        $student = Student::with(['latestApplication.company', 'placement.company', 'placement.schoolSupervisor'])->where('user_id', $user->id)->first();

        return Inertia::render('Siswa/PklStatus', [
            'student' => $student,
            'application' => $student ? $student->latestApplication : null,
            'placement' => $student ? $student->placement : null,
        ]);
    }

    // Hubin/Admin: List all applications
    public function adminIndex(): Response
    {
        $applications = PklApplication::with(['student.user', 'company', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total' => $applications->count(),
            'pending' => $applications->where('status', PklApplication::STATUS_SUBMITTED)->count(),
            'revision' => $applications->where('status', PklApplication::STATUS_REVISION)->count(),
            'approved' => $applications->where('status', PklApplication::STATUS_APPROVED)->count(),
            'rejected' => $applications->where('status', PklApplication::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'stats' => $stats,
        ]);
    }

    // Hubin/Admin: Approve Application
    public function approve(Request $request, $id)
    {
        $application = PklApplication::with('student.user')->findOrFail($id);
        $user = $request->user();

        $application->update([
            'status' => PklApplication::STATUS_APPROVED,
            'reviewed_by' => $user->id,
            'reviewed_at' => Carbon::now(),
        ]);

        // Notify Student
        Notification::create([
            'user_id' => $application->student->user_id,
            'title' => '🎉 Pengajuan PKL Disetujui',
            'message' => 'Pengajuan PKL kamu telah disetujui oleh Hubin. Tahap berikutnya adalah penempatan siswa ke perusahaan.',
            'type' => 'success',
            'icon' => 'CheckCircle',
            'link' => '/pkl/status',
        ]);

        return back()->with('success', "Pengajuan PKL atas nama {$application->student->user->name} telah disetujui.");
    }

    // Hubin/Admin: Request Revision
    public function revision(Request $request, $id)
    {
        $validated = $request->validate([
            'revision_note' => 'required|string',
        ]);

        $application = PklApplication::with('student.user')->findOrFail($id);
        $user = $request->user();

        $application->update([
            'status' => PklApplication::STATUS_REVISION,
            'revision_note' => $validated['revision_note'],
            'reviewed_by' => $user->id,
            'reviewed_at' => Carbon::now(),
        ]);

        // Notify Student
        Notification::create([
            'user_id' => $application->student->user_id,
            'title' => '⚠️ Permintaan Revisi Pengajuan PKL',
            'message' => "Hubin meminta revisi pengajuan: \"{$validated['revision_note']}\"",
            'type' => 'warning',
            'icon' => 'AlertCircle',
            'link' => '/pkl/pendaftaran',
        ]);

        return back()->with('success', 'Permintaan revisi berhasil dikirim ke siswa.');
    }

    // Hubin/Admin: Reject Application
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $application = PklApplication::with('student.user')->findOrFail($id);
        $user = $request->user();

        $application->update([
            'status' => PklApplication::STATUS_REJECTED,
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by' => $user->id,
            'reviewed_at' => Carbon::now(),
        ]);

        Notification::create([
            'user_id' => $application->student->user_id,
            'title' => '❌ Pengajuan PKL Ditolak',
            'message' => "Pengajuan PKL ditolak: {$validated['rejection_reason']}",
            'type' => 'danger',
            'icon' => 'XCircle',
            'link' => '/pkl/status',
        ]);

        return back()->with('success', 'Pengajuan PKL telah ditolak.');
    }
}
