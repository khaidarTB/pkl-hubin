<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePklExtensionRequest;
use App\Http\Requests\ReviewPklExtensionRequest;
use App\Models\Notification;
use App\Models\PklExtension;
use App\Models\Placement;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PklExtensionController extends Controller
{
    /**
     * List extensions based on role.
     * Admin: all extensions with filters.
     * Guru: extensions they requested.
     * Siswa: extensions for their placement.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = PklExtension::with([
            'placement.company',
            'student.user',
            'requester',
            'reviewer',
        ]);

        if ($user->isGuru()) {
            $query->where('requested_by', $user->id);
        } elseif ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $query->where('student_id', $student->id);
            } else {
                $query->whereRaw('1 = 0'); // No results
            }
        } elseif (!$user->isAdmin()) {
            $query->whereRaw('1 = 0');
        }

        // Filters (admin primarily)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('student.user', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('placement.company', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('requester', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        $extensions = $query->orderBy('created_at', 'desc')->get();

        // Stats
        $statsQuery = PklExtension::query();
        if ($user->isGuru()) {
            $statsQuery->where('requested_by', $user->id);
        } elseif ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $statsQuery->where('student_id', $student->id);
            }
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', PklExtension::STATUS_PENDING)->count(),
            'approved' => (clone $statsQuery)->where('status', PklExtension::STATUS_APPROVED)->count(),
            'rejected' => (clone $statsQuery)->where('status', PklExtension::STATUS_REJECTED)->count(),
        ];

        // Placements available for extension request based on user role
        $myPlacements = collect();
        if ($user->isAdmin()) {
            $myPlacements = Placement::with(['student.user', 'company', 'industry'])
                ->whereIn('status', ['Aktif', 'Belum Mulai', 'Terlambat'])
                ->get();
        } elseif ($user->isGuru()) {
            $myPlacements = Placement::with(['student.user', 'company', 'industry'])
                ->where('school_supervisor_id', $user->id)
                ->whereIn('status', ['Aktif', 'Belum Mulai', 'Terlambat'])
                ->get();
        } elseif ($user->isIndustri()) {
            $myPlacements = Placement::with(['student.user', 'company', 'industry'])
                ->where('industry_supervisor_id', $user->id)
                ->whereIn('status', ['Aktif', 'Belum Mulai', 'Terlambat'])
                ->get();
        }

        return Inertia::render('Perpanjangan/Index', [
            'extensions' => $extensions,
            'myPlacements' => $myPlacements,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show form to create extension request (guru only).
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isGuru()) {
            abort(403, 'Hanya guru pembimbing yang dapat mengajukan perpanjangan PKL.');
        }

        // Get active placements supervised by this guru
        $placements = Placement::with(['student.user', 'company'])
            ->where('school_supervisor_id', $user->id)
            ->whereIn('status', ['Aktif', 'Terlambat'])
            ->get();

        return Inertia::render('Perpanjangan/Create', [
            'placements' => $placements,
        ]);
    }

    /**
     * Store a new extension request.
     */
    public function store(StorePklExtensionRequest $request)
    {
        $placement = Placement::with('student.user', 'company')->findOrFail($request->placement_id);

        // Handle file upload
        $letterPath = null;
        $letterOriginalName = null;
        $letterMime = null;
        $letterSize = null;

        if ($request->hasFile('extension_letter')) {
            $file = $request->file('extension_letter');
            $letterOriginalName = $file->getClientOriginalName();
            $letterMime = $file->getMimeType();
            $letterSize = $file->getSize();
            // Store privately with generated filename
            $letterPath = $file->store('pkl-extensions', 'local');
        }

        $extension = PklExtension::create([
            'placement_id' => $placement->id,
            'student_id' => $placement->student_id,
            'requested_by' => $request->user()->id,
            'requester_role' => $request->user()->role,
            'old_start_date' => $placement->start_date,
            'old_end_date' => $placement->end_date,
            'requested_start_date' => $request->requested_start_date,
            'requested_end_date' => $request->requested_end_date,
            'reason' => $request->reason,
            'extension_letter_path' => $letterPath,
            'extension_letter_original_name' => $letterOriginalName,
            'extension_letter_mime' => $letterMime,
            'extension_letter_size' => $letterSize,
            'status' => PklExtension::STATUS_PENDING,
        ]);

        // Notify admin(s)
        $companyName = $placement->company->name ?? $placement->industry->name ?? 'Perusahaan';
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => '📋 Pengajuan Perpanjangan PKL',
                'message' => "{$request->user()->name} mengajukan perpanjangan PKL untuk {$placement->student->user->name} ({$companyName}).",
                'type' => 'info',
                'icon' => 'CalendarPlus',
                'link' => '/perpanjangan/' . $extension->id,
            ]);
        }

        // Notify requester (confirmation)
        Notification::create([
            'user_id' => $request->user()->id,
            'title' => '✅ Pengajuan Perpanjangan Terkirim',
            'message' => "Pengajuan perpanjangan PKL untuk {$placement->student->user->name} berhasil dikirim dan menunggu review Admin Hubin.",
            'type' => 'success',
            'icon' => 'CalendarPlus',
            'link' => '/perpanjangan/' . $extension->id,
        ]);

        return redirect()->route('perpanjangan.index')
            ->with('success', "Pengajuan perpanjangan PKL untuk {$placement->student->user->name} berhasil dikirim.");
    }

    /**
     * Show extension detail.
     *
     * The frontend renders request details inside the Perpanjangan/Index page,
     * so notification links redirect to the list instead of a separate page.
     */
    public function show(Request $request, $id): Response
    {
        $user = $request->user();
        $extension = PklExtension::with([
            'placement.company',
            'student.user',
            'requester',
        ])->findOrFail($id);

        // Authorization
        if ($user->isGuru() && $extension->requested_by !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke pengajuan ini.');
        }
        if ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            if (!$student || $extension->student_id !== $student->id) {
                abort(403, 'Anda tidak memiliki akses ke pengajuan ini.');
            }
        }
        if ($user->isIndustri() && $extension->requested_by !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        return redirect()->route('perpanjangan.index');
    }

    /**
     * Approve extension (admin only). Atomic transaction.
     */
    public function approve(ReviewPklExtensionRequest $request, $id)
    {
        $extension = PklExtension::with(['placement', 'student.user', 'requester'])
            ->findOrFail($id);

        if ($extension->status !== PklExtension::STATUS_PENDING) {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        DB::beginTransaction();

        try {
            // 1. Update extension status
            $extension->update([
                'status' => PklExtension::STATUS_APPROVED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => Carbon::now(),
                'review_feedback' => $request->review_feedback,
            ]);

            // 2. Update placement end_date
            $extension->placement->update([
                'end_date' => $extension->requested_end_date,
            ]);

            // 3. Notify pembimbing (requester)
            Notification::create([
                'user_id' => $extension->requested_by,
                'title' => '✅ Perpanjangan PKL Disetujui',
                'message' => "Perpanjangan PKL untuk {$extension->student->user->name} telah disetujui. Periode baru: s.d. " . Carbon::parse($extension->requested_end_date)->format('d/m/Y') . ".",
                'type' => 'success',
                'icon' => 'CalendarCheck',
                'link' => '/perpanjangan/' . $extension->id,
            ]);

            // 4. Notify siswa
            Notification::create([
                'user_id' => $extension->student->user_id,
                'title' => '📅 Periode PKL Diperpanjang',
                'message' => "Periode PKL Anda telah diperpanjang hingga " . Carbon::parse($extension->requested_end_date)->format('d/m/Y') . ".",
                'type' => 'success',
                'icon' => 'CalendarCheck',
                'link' => '/perpanjangan/' . $extension->id,
            ]);

            DB::commit();

            return back()->with('success', "Perpanjangan PKL untuk {$extension->student->user->name} berhasil disetujui.");
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->with('error', 'Terjadi kesalahan saat memproses persetujuan. Silakan coba lagi.');
        }
    }

    /**
     * Reject extension (admin only).
     */
    public function reject(ReviewPklExtensionRequest $request, $id)
    {
        $extension = PklExtension::with(['student.user', 'requester'])
            ->findOrFail($id);

        if ($extension->status !== PklExtension::STATUS_PENDING) {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $extension->update([
            'status' => PklExtension::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => Carbon::now(),
            'review_feedback' => $request->review_feedback,
        ]);

        // Notify pembimbing
        Notification::create([
            'user_id' => $extension->requested_by,
            'title' => '❌ Perpanjangan PKL Ditolak',
            'message' => "Pengajuan perpanjangan PKL untuk {$extension->student->user->name} ditolak. Feedback: {$request->review_feedback}",
            'type' => 'warning',
            'icon' => 'CalendarX',
            'link' => '/perpanjangan/' . $extension->id,
        ]);

        // Notify siswa
        Notification::create([
            'user_id' => $extension->student->user_id,
            'title' => '❌ Perpanjangan PKL Ditolak',
            'message' => "Pengajuan perpanjangan PKL Anda ditolak oleh Admin Hubin.",
            'type' => 'warning',
            'icon' => 'CalendarX',
            'link' => '/perpanjangan/' . $extension->id,
        ]);

        return back()->with('success', "Pengajuan perpanjangan PKL untuk {$extension->student->user->name} ditolak.");
    }

    /**
     * Cancel own pending request (guru only).
     */
    public function cancel(Request $request, $id)
    {
        $extension = PklExtension::findOrFail($id);

        if (!$request->user()->isGuru() || $extension->requested_by !== $request->user()->id) {
            abort(403, 'Anda tidak memiliki hak untuk membatalkan pengajuan ini.');
        }

        if ($extension->status !== PklExtension::STATUS_PENDING) {
            return back()->with('error', 'Hanya pengajuan dengan status pending yang dapat dibatalkan.');
        }

        $extension->update([
            'status' => PklExtension::STATUS_CANCELLED,
        ]);

        return back()->with('success', 'Pengajuan perpanjangan PKL berhasil dibatalkan.');
    }

    /**
     * Download extension letter (authorized access only).
     */
    public function downloadLetter(Request $request, $id)
    {
        $extension = PklExtension::findOrFail($id);
        $user = $request->user();

        // Only admin or the requester guru can download
        if (!$user->isAdmin() && $extension->requested_by !== $user->id) {
            abort(403, 'Anda tidak memiliki hak untuk mengunduh surat ini.');
        }

        if (!$extension->extension_letter_path || !Storage::disk('local')->exists($extension->extension_letter_path)) {
            abort(404, 'File surat perpanjangan tidak ditemukan.');
        }

        $downloadName = $extension->extension_letter_original_name ?? 'surat-perpanjangan.pdf';

        return Storage::disk('local')->download(
            $extension->extension_letter_path,
            $downloadName,
            ['Content-Type' => $extension->extension_letter_mime ?? 'application/octet-stream']
        );
    }
}
