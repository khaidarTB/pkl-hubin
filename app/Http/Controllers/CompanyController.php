<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $companies = Company::withCount('placements')->orderBy('name')->get();

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'website' => 'nullable|string',
            'industry_type' => 'required|string',
            'description' => 'nullable|string',
            'supervisor_name' => 'nullable|string',
            'student_quota' => 'required|integer|min:1',
        ]);

        Company::create($validated);

        return back()->with('success', "Perusahaan mitra \"{$validated['name']}\" berhasil ditambahkan!");
    }
}
