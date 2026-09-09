<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;
use App\Models\Company;
use App\Models\PklPeriod;
use App\Models\Placement;
use App\Models\PklApplication;
use App\Models\User;
use App\Models\Notification;
use Carbon\Carbon;

class PlacementController extends Controller
{
    // Hubin/Admin: List unplaced & placed students
    public function index(): Response
    {
        // Students with approved application who don't have placement yet
        $unplacedStudents = Student::with(['user', 'latestApplication.company'])
            ->whereHas('latestApplication', function ($q) {
                $q->where('status', PklApplication::STATUS_APPROVED);
            })
            ->whereDoesntHave('placement')
            ->get();

        $activePlacements = Placement::with(['student.user', 'company', 'schoolSupervisor', 'industrySupervisor'])
            ->orderBy('created_at', 'desc')
            ->get();

        $companies = Company::where('partnership_status', 'active')->get();
        $teachers = User::where('role', 'guru')->get();
        $industrySupervisors = User::where('role', 'industri')->get();
        $activePeriod = PklPeriod::where('status', 'active')->first();

        return Inertia::render('Admin/Placements/Index', [
            'unplacedStudents' => $unplacedStudents,
            'activePlacements' => $activePlacements,
            'companies' => $companies,
            'teachers' => $teachers,
            'industrySupervisors' => $industrySupervisors,
            'activePeriod' => $activePeriod,
        ]);
    }

    // Hubin/Admin: Place student into company
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'company_id' => 'required|exists:companies,id',
            'school_supervisor_id' => 'required|exists:users,id',
            'industry_supervisor_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $student = Student::with('user', 'latestApplication')->findOrFail($validated['student_id']);
        $company = Company::findOrFail($validated['company_id']);
        $teacher = User::findOrFail($validated['school_supervisor_id']);
        $activePeriod = PklPeriod::where('status', 'active')->first();

        $placement = Placement::create([
            'student_id' => $student->id,
            'company_id' => $company->id,
            'pkl_application_id' => $student->latestApplication ? $student->latestApplication->id : null,
            'pkl_period_id' => $activePeriod ? $activePeriod->id : null,
            'school_supervisor_id' => $teacher->id,
            'industry_supervisor_id' => $validated['industry_supervisor_id'] ?? null,
            'placed_by' => $request->user()->id,
            'placed_at' => Carbon::now(),
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'Aktif',
        ]);

        // Notify Student
        Notification::create([
            'user_id' => $student->user_id,
            'title' => '📍 Penempatan PKL Berhasil',
            'message' => "Kamu ditempatkan di: {$company->name}. Guru Pembimbing: {$teacher->name}.",
            'type' => 'info',
            'icon' => 'MapPin',
            'link' => '/dashboard',
        ]);

        // Notify Teacher
        Notification::create([
            'user_id' => $teacher->id,
            'title' => '📋 Siswa Bimbingan Baru',
            'message' => "{$student->user->name} ({$student->class}) ditugaskan di bawah bimbingan Anda di {$company->name}.",
            'type' => 'info',
            'icon' => 'UserCheck',
            'link' => '/dashboard',
        ]);

        return back()->with('success', "Penempatan PKL untuk {$student->user->name} di {$company->name} berhasil disimpan.");
    }

    public function update(Request $request, $id)
    {
        $placement = Placement::with('student.user')->findOrFail($id);

        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'school_supervisor_id' => 'required|exists:users,id',
            'industry_supervisor_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:Aktif,Bermasalah,Selesai,Dibatalkan',
        ]);

        $placement->update($validated);

        return back()->with('success', "Data penempatan {$placement->student->user->name} berhasil diperbarui.");
    }

    public function quickStatus(Request $request, $id)
    {
        $placement = Placement::with('student.user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Aktif,Bermasalah,Selesai,Dibatalkan',
            'school_supervisor_id' => 'nullable|exists:users,id',
        ]);

        $placement->update(array_filter($validated));

        return back()->with('success', "Status penempatan {$placement->student->user->name} diubah menjadi \"{$validated['status']}\".");
    }

    public function destroy($id)
    {
        $placement = Placement::with('student.user')->findOrFail($id);
        $studentName = $placement->student->user->name ?? 'Siswa';
        $placement->delete();

        return back()->with('success', "Penempatan PKL untuk {$studentName} berhasil dibatalkan/dihapus.");
    }
}
