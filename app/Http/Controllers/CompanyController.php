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
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'allowed_radius' => 'nullable|integer|min:50|max:5000',
        ]);

        if (blank($validated['allowed_radius'] ?? null)) {
            $validated['allowed_radius'] = config('attendance.default_radius', 100);
        }

        Company::create($validated);

        return back()->with('success', "Perusahaan mitra \"{$validated['name']}\" berhasil ditambahkan!");
    }

    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);

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
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'allowed_radius' => 'nullable|integer|min:50|max:5000',
            'partnership_status' => 'nullable|string|in:active,inactive,pending',
        ]);

        $company->update($validated);

        return back()->with('success', "Data perusahaan \"{$company->name}\" berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $company = Company::withCount('placements')->findOrFail($id);

        if ($company->placements_count > 0) {
            return back()->with('error', "Perusahaan tidak dapat dihapus karena memiliki {$company->placements_count} siswa aktif/terdaftar.");
        }

        $company->delete();

        return back()->with('success', "Perusahaan mitra berhasil dihapus.");
    }
}
