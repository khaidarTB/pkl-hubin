<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Attendance;
use App\Models\Student;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        if ($user->isSiswa()) {
            $student = Student::where('user_id', $user->id)->first();
            $attendances = Attendance::where('student_id', $student->id)
                ->orderBy('date', 'desc')
                ->get();

            $todayAttendance = Attendance::where('student_id', $student->id)
                ->where('date', Carbon::today()->format('Y-m-d'))
                ->first();

            return Inertia::render('Absensi/Index', [
                'attendances' => $attendances,
                'todayAttendance' => $todayAttendance,
                'todayDate' => Carbon::now()->isoFormat('D MMMM YYYY'),
                'currentTime' => Carbon::now()->format('H:i'),
            ]);
        }

        // Admin/Guru view
        $attendances = Attendance::with(['student.user', 'student.placement.industry'])
            ->orderBy('date', 'desc')
            ->limit(100)
            ->get();

        return Inertia::render('Absensi/AdminIndex', [
            'attendances' => $attendances,
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $today = Carbon::today()->format('Y-m-d');
        $existing = Attendance::where('student_id', $student->id)->where('date', $today)->first();

        if ($existing && $existing->check_in) {
            return back()->with('error', 'Anda sudah melakukan absensi masuk hari ini.');
        }

        $lat = $request->input('latitude', -6.2088);
        $lng = $request->input('longitude', 106.8456);

        Attendance::updateOrCreate(
            ['student_id' => $student->id, 'date' => $today],
            [
                'check_in' => Carbon::now()->format('H:i'),
                'latitude' => $lat,
                'longitude' => $lng,
                'location_address' => 'PT Digital Nusantara (Terverifikasi GPS)',
                'status' => 'Hadir',
            ]
        );

        return back()->with('success', 'Absensi berhasil dicatat.');
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $today = Carbon::today()->format('Y-m-d');
        $attendance = Attendance::where('student_id', $student->id)->where('date', $today)->firstOrFail();

        $attendance->update([
            'check_out' => Carbon::now()->format('H:i'),
        ]);

        return back()->with('success', 'Absensi pulang berhasil dicatat.');
    }
}
