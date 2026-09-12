<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
            'jam_masuk' => ['nullable', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/'],
            'jam_keluar' => ['nullable', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/', 'after:jam_masuk'],
        ]);

        $validated['jam_masuk'] = $this->normalizeTime($validated['jam_masuk'] ?? null);
        $validated['jam_keluar'] = $this->normalizeTime($validated['jam_keluar'] ?? null);

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
            'jam_masuk' => ['nullable', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/'],
            'jam_keluar' => ['nullable', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/', 'after:jam_masuk'],
            'partnership_status' => 'nullable|string|in:active,inactive,pending',
        ]);

        $validated['jam_masuk'] = $this->normalizeTime($validated['jam_masuk'] ?? null);
        $validated['jam_keluar'] = $this->normalizeTime($validated['jam_keluar'] ?? null);

        $company->update($validated);

        return back()->with('success', "Data perusahaan \"{$company->name}\" berhasil diperbarui.");
    }

    private function normalizeTime(?string $time): ?string
    {
        return $time !== null && $time !== '' ? substr($time, 0, 5) : null;
    }

    public function destroy($id)
    {
        $company = Company::withCount('placements')->findOrFail($id);

        if ($company->placements_count > 0) {
            return back()->with('error', "Perusahaan tidak dapat dihapus karena memiliki {$company->placements_count} siswa aktif/terdaftar.");
        }

        $company->delete();

        return back()->with('success', 'Perusahaan mitra berhasil dihapus.');
    }
}
