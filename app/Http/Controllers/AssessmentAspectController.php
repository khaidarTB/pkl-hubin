<?php

namespace App\Http\Controllers;

use App\Models\AssessmentAspect;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentAspectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/AssessmentAspects/Index', [
            'aspects' => AssessmentAspect::withCount('scores')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateAspect($request);

        $validated['sort_order'] = $validated['sort_order']
            ?? AssessmentAspect::max('sort_order') + 1;
        $validated['is_active'] = $request->boolean('is_active', true);

        $aspect = AssessmentAspect::create($validated);

        return back()->with('success', "Aspek penilaian \"{$aspect->name}\" berhasil ditambahkan.");
    }

    public function update(Request $request, AssessmentAspect $aspect)
    {
        $validated = $this->validateAspect($request);
        $validated['is_active'] = $request->boolean('is_active', $aspect->is_active);

        $aspect->update($validated);

        return back()->with('success', "Aspek penilaian \"{$aspect->name}\" berhasil diperbarui.");
    }

    public function destroy(AssessmentAspect $aspect)
    {
        if ($aspect->scores()->exists()) {
            // Aspek sudah dipakai untuk penilaian — arsipkan, jangan dihapus permanen.
            $aspect->update(['is_active' => false]);

            return back()->with('success', "Aspek \"{$aspect->name}\" dinonaktifkan (sudah dipakai penilaian).");
        }

        $name = $aspect->name;
        $aspect->delete();

        return back()->with('success', "Aspek penilaian \"{$name}\" berhasil dihapus.");
    }

    private function validateAspect(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'max_score' => 'required|integer|min:1|max:1000',
            'min_score' => 'required|integer|min:0|lte:max_score',
            'sort_order' => 'nullable|integer|min:0',
        ]);
    }
}