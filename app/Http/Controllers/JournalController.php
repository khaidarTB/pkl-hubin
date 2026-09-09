<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Journal;
use App\Models\Student;
use Carbon\Carbon;

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

        if ($user->isIndustri()) {
            // Pending approval list
            $journals = Journal::with(['student.user', 'student.placement.industry'])
                ->orderBy('date', 'desc')
                ->get();

            return Inertia::render('Journal/Approval', [
                'journals' => $journals,
            ]);
        }

        // Admin / Guru
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
        $journal = Journal::findOrFail($id);
        $journal->update([
            'status' => 'Approved',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);

        return back()->with('success', 'Jurnal berhasil di-approve.');
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
}
