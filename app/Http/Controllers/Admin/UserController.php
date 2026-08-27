<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
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

        return back()->with('success', 'Guru berhasil ditambahkan.');
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'guru') {
            return back()->with('error', 'Hanya akun guru yang dapat dihapus.');
        }

        $user->delete();

        return back()->with('success', 'Guru berhasil dihapus.');
    }
}
