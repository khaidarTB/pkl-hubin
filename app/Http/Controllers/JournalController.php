<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            $journals = Journal::where('student_id', $student->id)
                ->orderBy('date', 'desc')
                ->get();

            return Inertia::render('Journal/Index', [
                'journals' => $journals,
            ]);
        }

        // Industri (pembimbing DUDI) & Guru/walikelas (pembimbing sekolah)
        // keduanya berhak approve jurnal, masing-masing untuk siswa bimbingannya.
        if ($user->isIndustri() || $user->isGuru()) {
            $supervisorColumn = $user->isIndustri()
                ? 'industry_supervisor_id'
                : 'school_supervisor_id';

            $signatureColumn = $user->isIndustri()
                ? 'industry_signature'
                : 'school_signature';

            $journals = Journal::with(['student.user', 'student.placement.industry', 'approver'])
                ->whereHas('student.placement', fn ($q) => $q->where($supervisorColumn, $user->id))
                ->orderBy('date', 'desc')
                ->get();

            // Tandai apakah tanda tangan approver sudah tersimpan di penempatan,
            // sehingga approval berikutnya tidak perlu upload ulang (TTD sekali saja).
            $journals->each(function ($journal) use ($signatureColumn) {
                $journal->signature_ready = ! empty($journal->student?->placement?->{$signatureColumn});
            });

            return Inertia::render('Journal/Approval', [
                'journals' => $journals,
            ]);
        }

        // Admin
        $journals = Journal::with(['student.user', 'student.placement.industry', 'approver'])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Journal/AdminIndex', [
            'journals' => $journals,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'date' => 'required|date',
            'activity' => 'required|string|max:255',
            'description' => 'required|string',
            'skill' => 'required|string',
            'obstacle' => 'nullable|string',
            'solution' => 'nullable|string',
        ]);

        Journal::create([
            'student_id' => $student->id,
            'date' => $validated['date'],
            'activity' => $validated['activity'],
            'description' => $validated['description'],
            'skill' => $validated['skill'],
            'obstacle' => $validated['obstacle'] ?? null,
            'solution' => $validated['solution'] ?? null,
            'status' => 'Menunggu Approval',
        ]);

        return redirect()->route('journals.index')->with('success', 'Jurnal berhasil disimpan dan Menunggu Approval.');
    }

    public function approve(Request $request, $id)
    {
        $journal = Journal::with('student.placement')->findOrFail($id);
        $user = $request->user();

        $isIndustri = $user->isIndustri();
        $signatureColumn = $isIndustri ? 'industry_signature' : 'school_signature';
        $placement = $journal->student?->placement;

        // Tanda tangan cukup diunggah sekali (tersimpan di placement).
        // Approval berikutnya otomatis memakai tanda tangan yang sama.
        $existingSignature = $placement?->{$signatureColumn} ?? null;

        if (! $existingSignature) {
            $request->validate([
                'signature' => 'required|image|mimes:png,jpg,jpeg|max:3072',
            ]);
        }

        $signaturePath = $existingSignature;
        if (! $signaturePath && $request->hasFile('signature')) {
            $signaturePath = $request->file('signature')->store('signatures', 'public');
        }

        if ($placement && $signaturePath && ! $existingSignature) {
            $placement->update([$signatureColumn => $signaturePath]);
        }

        $journal->update([
            'status' => 'Approved',
            'approved_by' => $user->id,
            'approved_at' => Carbon::now(),
            'approved_signature' => $signaturePath,
        ]);

        return back()->with('success', $existingSignature
            ? 'Jurnal berhasil di-approve (tanda tangan otomatis dipakai).'
            : 'Jurnal berhasil di-approve dengan tanda tangan.');
    }

    public function revision(Request $request, $id)
    {
        $request->validate([
            'revision_note' => 'required|string',
        ]);

        $journal = Journal::findOrFail($id);
        $journal->update([
            'status' => 'Revision',
            'revision_note' => $request->input('revision_note'),
        ]);

        return back()->with('success', 'Permintaan revisi jurnal telah dikirimkan ke siswa.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();
        $journal = Journal::where('student_id', $student->id)->findOrFail($id);

        $validated = $request->validate([
            'date' => 'required|date',
            'activity' => 'required|string|max:255',
            'description' => 'required|string',
            'skill' => 'required|string',
            'obstacle' => 'nullable|string',
            'solution' => 'nullable|string',
        ]);

        $journal->update(array_merge($validated, [
            'status' => 'Menunggu Approval',
        ]));

        return back()->with('success', 'Perbaikan jurnal berhasil disimpan dan diajukan ulang untuk approval.');
    }

    public function download(Request $request)
    {
        $user = $request->user();

        $studentBase = Student::with([
            'user',
            'placement.company',
            'placement.industry',
            'placement.industrySupervisor',
            'placement.schoolSupervisor',
        ])->whereNotNull('id');

        if ($user->isSiswa()) {
            $student = $studentBase->where('user_id', $user->id)->firstOrFail();
        } else {
            $request->validate(['student_id' => 'required|exists:students,id']);

            $studentBase->where('id', $request->integer('student_id'));

            if ($user->isGuru()) {
                $studentBase->whereHas('placement', fn ($q) => $q->where('school_supervisor_id', $user->id));
            } elseif ($user->isIndustri()) {
                $studentBase->whereHas('placement', fn ($q) => $q->where('industry_supervisor_id', $user->id));
            }

            $student = $studentBase->firstOrFail();
        }

        $journals = $student->journals()->orderBy('date')->get();

        $placement = $student->placement;
        $companyName = $placement?->company?->name ?? $placement?->industry?->name ?? '-';

        // Tentukan tanda tangan & nama pembimbing berdasarkan siapa yang download.
        // Prioritas: tanda tangan yang tersimpan di placement dipakai otomatis.
        $industrySigPath = $placement?->industry_signature
            ? storage_path('app/public/'.$placement->industry_signature)
            : null;
        $schoolSigPath = $placement?->school_signature
            ? storage_path('app/public/'.$placement->school_signature)
            : null;

        if ($user->isGuru() && $schoolSigPath && file_exists($schoolSigPath)) {
            $signaturePath = $schoolSigPath;
            $supervisorName = $placement?->schoolSupervisor?->name ?? '-';
            $approverLabel = 'Pembimbing Sekolah / Walikelas';
        } elseif ($user->isIndustri() && $industrySigPath && file_exists($industrySigPath)) {
            $signaturePath = $industrySigPath;
            $supervisorName = $placement?->industrySupervisor?->name ?? '-';
            $approverLabel = 'Pembimbing Industri';
        } else {
            // Fallback: pakai industri jika ada, lalu sekolah
            $signaturePath = ($industrySigPath && file_exists($industrySigPath))
                ? $industrySigPath
                : (($schoolSigPath && file_exists($schoolSigPath)) ? $schoolSigPath : null);
            $supervisorName = $placement?->industrySupervisor?->name
                ?? $placement?->schoolSupervisor?->name
                ?? '-';
            $approverLabel = $placement?->industrySupervisor
                ? 'Pembimbing Industri'
                : 'Pembimbing Sekolah / Walikelas';
        }

        $signatureDataUri = null;
        if ($signaturePath) {
            $mime = mime_content_type($signaturePath) ?: 'image/png';
            $signatureDataUri = 'data:'.$mime.';base64,'.base64_encode(file_get_contents($signaturePath));
        }

        $pdf = Pdf::loadView('pdf.jurnal', [
            'student' => $student,
            'journals' => $journals,
            'companyName' => $companyName,
            'supervisorName' => $supervisorName,
            'approverLabel' => $approverLabel,
            'signatureDataUri' => $signatureDataUri,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Jurnal_PKL_'.($student->nis ?? $student->id).'.pdf');
    }
}
