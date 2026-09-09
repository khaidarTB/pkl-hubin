<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\GeoCheckinRequest;
use App\Models\Attendance;
use App\Models\AttendanceAttempt;
use App\Models\Company;
use App\Models\Student;
use App\Services\AttendanceService;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendanceService)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isSiswa()) {
            return $this->studentIndex($user);
        }

        return $this->adminIndex($request);
    }

    private function studentIndex($user): Response
    {
        $student = Student::with(['placement.company'])
            ->where('user_id', $user->id)
            ->first();

        $company = $student?->placement?->company;

        $history = Attendance::where('student_id', $student?->id)
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->simplePaginate(20);

        $todayAttendance = $student
            ? Attendance::where('student_id', $student->id)
                ->where('date', Carbon::today()->format('Y-m-d'))
                ->first()
            : null;

        return Inertia::render('Absensi/Index', [
            'student' => $student,
            'company' => $company,
            'todayAttendance' => $todayAttendance,
            'history' => $history,
            'todayDate' => Carbon::now()->isoFormat('D MMMM YYYY'),
            'currentTime' => Carbon::now()->format('H:i'),
            'config' => [
                'maxGpsAccuracy' => config('attendance.max_gps_accuracy'),
                'defaultRadius' => config('attendance.default_radius'),
                'window' => config('attendance.check_in_window'),
            ],
        ]);
    }

    private function adminIndex(Request $request): Response
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isGuru()) {
            abort(403, 'Anda tidak berhak mengakses halaman ini.');
        }

        $date = $request->query('date');
        $class = $request->query('class');
        $companyId = $request->query('company_id');
        $status = $request->query('status');
        $search = trim((string) $request->query('search'));

        $attendances = Attendance::query()
            ->with(['student.user', 'student.placement.company'])
            ->when($date, fn ($q) => $q->whereDate('date', $date))
            ->when($status && in_array($status, ['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa']), fn ($q) => $q->where('status', $status))
            ->when($class, fn ($q) => $q->whereHas('student', fn ($s) => $s->where('class', $class)))
            ->when($companyId, fn ($q) => $q->whereHas('student.placement', fn ($p) => $p->where('company_id', $companyId)))
            ->when($search !== '', fn ($q) => $q->whereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$search}%")))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Absensi/AdminIndex', [
            'attendances' => $attendances,
            'companies' => Company::orderBy('name')->get(['id', 'name']),
            'classes' => Student::query()->distinct()->orderBy('class')->pluck('class'),
            'filters' => [
                'date' => $date,
                'class' => $class,
                'company_id' => $companyId,
                'status' => $status,
                'search' => $search,
            ],
            'stats' => [
                'hadir' => Attendance::where('status', 'Hadir')->count(),
                'terlambat' => Attendance::where('status', 'Terlambat')->count(),
                'attempts_rejected' => AttendanceAttempt::where('result', 'DITOLAK')->count(),
            ],
        ]);
    }

    /**
     * SMART GEO-ATTENDANCE: server adalah source of truth.
     * Menerima hanya koordinat mentah dari GPS; jarak, status, dan waktu
     * dihitung/ditentukan ulang sepenuhnya di server.
     */
    public function geoCheckIn(GeoCheckinRequest $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json([
                'status' => 'DITOLAK',
                'failure_reason' => 'STUDENT_NOT_ASSIGNED_TO_COMPANY',
                'message' => 'Data siswa tidak ditemukan. Hubungi admin Hubin.',
                'attendance' => null,
            ], 422);
        }

        $result = $this->attendanceService->processCheckin(
            $student,
            (float) $request->input('latitude'),
            (float) $request->input('longitude'),
            (float) $request->input('accuracy')
        );

        return response()->json($result, $result['status'] === 'DITOLAK' ? 422 : 200);
    }

    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $attendance = Attendance::with([
            'student.user',
            'student.placement.company',
            'student.placement.industrySupervisor',
        ])->findOrFail($id);

        // Hanya pemilik absensi atau admin/guru yang boleh melihat detail.
        $isOwner = $user->isSiswa() && $attendance->student_id === optional($user->student)->id;
        if (! $user->isAdmin() && ! $user->isGuru() && ! $isOwner) {
            abort(403, 'Anda tidak berhak mengakses data ini.');
        }

        $attempt = AttendanceAttempt::where('student_id', $attendance->student_id)
            ->whereDate('server_timestamp', $attendance->date)
            ->latest('id')
            ->first();

        return Inertia::render('Absensi/Detail', [
            'attendance' => $attendance,
            'attempt' => $attempt,
            'isOwner' => $isOwner,
        ]);
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