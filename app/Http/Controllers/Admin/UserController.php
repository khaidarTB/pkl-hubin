<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // ================== GURU ==================
    public function index(): Response
    {
        $users = User::where('role', 'guru')
            ->latest()
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Admin/Users/Index', compact('users'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'guru',
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Guru pembimbing berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        if ($user->role !== 'guru') {
            return back()->with('error', 'Hanya akun guru yang dapat diedit melalui menu ini.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (!empty($validated['password'])) {
            $user->password = $validated['password'];
        }
        $user->save();

        return back()->with('success', "Data guru {$user->name} berhasil diperbarui.");
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'guru') {
            return back()->with('error', 'Hanya akun guru yang dapat dihapus.');
        }

        $user->delete();

        return back()->with('success', 'Guru berhasil dihapus.');
    }

    // ================== SISWA ==================
    public function studentsIndex(): Response
    {
        $students = Student::with(['user', 'placement.company'])
            ->latest()
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'user_id' => $s->user_id,
                    'name' => $s->user->name ?? 'Siswa',
                    'email' => $s->user->email ?? '-',
                    'nis' => $s->nis ?? '-',
                    'class' => $s->class ?? '-',
                    'major' => $s->major ?? '-',
                    'phone' => $s->phone ?? '-',
                    'company' => $s->placement->company->name ?? 'Belum Ada',
                    'placement_status' => $s->placement->status ?? 'Belum Ditempatkan',
                    'created_at' => $s->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
        ]);
    }

    public function storeStudent(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'nis' => 'required|string|max:30|unique:students,nis',
            'class' => 'required|string|max:50',
            'major' => 'required|string|max:100',
            'phone' => 'nullable|string|max:30',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'siswa',
            'password' => $validated['password'],
        ]);

        Student::create([
            'user_id' => $user->id,
            'nis' => $validated['nis'],
            'class' => $validated['class'],
            'major' => $validated['major'],
            'phone' => $validated['phone'] ?? null,
        ]);

        return back()->with('success', "Data siswa {$validated['name']} berhasil ditambahkan.");
    }

    public function updateStudent(Request $request, $id)
    {
        $student = Student::with('user')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
            'nis' => ['required', 'string', 'max:30', Rule::unique('students', 'nis')->ignore($student->id)],
            'class' => 'required|string|max:50',
            'major' => 'required|string|max:100',
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6',
        ]);

        $student->update([
            'nis' => $validated['nis'],
            'class' => $validated['class'],
            'major' => $validated['major'],
            'phone' => $validated['phone'] ?? null,
        ]);

        $student->user->name = $validated['name'];
        $student->user->email = $validated['email'];
        if (!empty($validated['password'])) {
            $student->user->password = $validated['password'];
        }
        $student->user->save();

        return back()->with('success', "Data siswa {$student->user->name} berhasil diperbarui.");
    }

    public function destroyStudent($id)
    {
        $student = Student::with('user')->findOrFail($id);
        $name = $student->user->name ?? 'Siswa';

        $user = $student->user;
        $student->delete();
        if ($user) {
            $user->delete();
        }

        return back()->with('success', "Siswa {$name} berhasil dihapus.");
    }
}
