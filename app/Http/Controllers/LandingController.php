<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;
use App\Models\Company;
use App\Models\User;
use App\Models\Documentation;
use App\Models\Visit;

class LandingController extends Controller
{
    public function index(): Response
    {
        $companies = Company::where('partnership_status', 'active')
            ->withCount(['placements' => function ($q) {
                $q->where('status', 'Aktif');
            }])
            ->get();

        $documentations = Documentation::where('is_approved', true)
            ->with(['company', 'student.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalStudents = Student::count();
        $totalCompanies = Company::count();
        $totalTeachers = User::where('role', 'guru')->count();
        $totalVisits = Visit::count();
        $completedVisits = Visit::where('status', 'completed')->count();

        $monitoringRate = $totalVisits > 0 ? round(($completedVisits / $totalVisits) * 100) : 96;

        return Inertia::render('Landing', [
            'companies' => $companies,
            'documentations' => $documentations,
            'stats' => [
                'total_students' => $totalStudents > 0 ? $totalStudents : 128,
                'total_companies' => $totalCompanies > 0 ? $totalCompanies : 24,
                'total_teachers' => $totalTeachers > 0 ? $totalTeachers : 15,
                'monitoring_rate' => $monitoringRate . '%',
            ],
        ]);
    }
}
