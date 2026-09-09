<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PklPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PklPeriodController extends Controller
{
    public function index(): Response
    {
        $periods = PklPeriod::withCount(['placements', 'applications'])
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Admin/Periods/Index', [
            'periods' => $periods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:upcoming,active,completed',
        ]);

        if ($validated['status'] === 'active') {
            PklPeriod::where('status', 'active')->update(['status' => 'completed']);
        }

        PklPeriod::create($validated);

        return back()->with('success', "Periode PKL \"{$validated['name']}\" berhasil dibuat.");
    }

    public function update(Request $request, $id)
    {
        $period = PklPeriod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:upcoming,active,completed',
        ]);

        if ($validated['status'] === 'active' && $period->status !== 'active') {
            PklPeriod::where('id', '!=', $id)->where('status', 'active')->update(['status' => 'completed']);
        }

        $period->update($validated);

        return back()->with('success', "Periode PKL \"{$period->name}\" berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $period = PklPeriod::withCount('placements')->findOrFail($id);

        if ($period->placements_count > 0) {
            return back()->with('error', "Periode tidak dapat dihapus karena sudah memiliki {$period->placements_count} penempatan.");
        }

        $period->delete();

        return back()->with('success', "Periode PKL berhasil dihapus.");
    }
}
