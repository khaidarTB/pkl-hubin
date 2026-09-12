<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceAttempt;
use App\Models\Setting;
use App\Models\Student;
use App\Services\Support\GeoCalculator;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * Source of truth untuk absensi geo-lokasi.
 *
 * Frontend (TypeScript + geolib) hanya berperan sebagai client: mengumpulkan
 * koordinat GPS dan menampilkan estimasi. Status final, jarak, tanggal/waktu,
 * dan validasi seluruhnya dihitung ulang di sini oleh server.
 */
class AttendanceService
{
    public const RESULT_HADIR = 'HADIR';

    public const RESULT_TERLAMBAT = 'TERLAMBAT';

    public const RESULT_DITOLAK = 'DITOLAK';

    public const ACTION_CHECK_IN = 'CHECK_IN';

    public const ACTION_CHECK_OUT = 'CHECK_OUT';

    public const FAILURE_LOCATION_OUTSIDE_RADIUS = 'LOCATION_OUTSIDE_RADIUS';

    public const FAILURE_GPS_ACCURACY_TOO_LOW = 'GPS_ACCURACY_TOO_LOW';

    public const FAILURE_OUTSIDE_ATTENDANCE_TIME = 'OUTSIDE_ATTENDANCE_TIME';

    public const FAILURE_STUDENT_NOT_ASSIGNED = 'STUDENT_NOT_ASSIGNED_TO_COMPANY';

    public const FAILURE_COMPANY_NOT_CONFIGURED = 'COMPANY_LOCATION_NOT_CONFIGURED';

    public const FAILURE_ALREADY_ATTENDED = 'ALREADY_ATTENDED';

    public const FAILURE_NOT_CHECKED_IN = 'NOT_CHECKED_IN';

    public const FAILURE_ALREADY_CHECKED_OUT = 'ALREADY_CHECKED_OUT';

    private const LOCATION_VERIFIED = 'VERIFIED';

    private const LOCATION_REJECTED = 'REJECTED';

    private const LOCATION_OUTSIDE_RADIUS = 'OUTSIDE_RADIUS';

    private const LOCATION_LOW_ACCURACY = 'LOW_ACCURACY';

    private const TIME_ON_TIME = 'ON_TIME';

    private const TIME_LATE = 'LATE';

    private const TIME_OUTSIDE_WORKING_HOURS = 'OUTSIDE_WORKING_HOURS';

    /**
     * Proses absensi masuk berbasis GPS.
     *
     * @return array{status: string, failure_reason: ?string, message: string, attendance: ?Attendance, ...}
     */
    public function processCheckin(Student $student, float $latitude, float $longitude, float $accuracy): array
    {
        $now = now();
        $today = $now->toDateString();

        $placement = $student->placement;
        $company = $placement?->company;

        // 1. Siswa harus punya penempatan PKL aktif.
        if (! $placement || $placement->status !== 'Aktif') {
            return $this->reject(
                $student, null, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_STUDENT_NOT_ASSIGNED,
                'Penempatan PKL aktif tidak ditemukan. Hubungi admin Hubin.', $now
            );
        }

        // 2. Siswa harus ditempatkan di sebuah perusahaan.
        if (! $company) {
            return $this->reject(
                $student, null, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_STUDENT_NOT_ASSIGNED,
                'Siswa belum ditempatkan di perusahaan tujuan PKL.', $now
            );
        }

        // 3. Perusahaan harus punya koordinat & radius yang terkonfigurasi.
        if (! $company->latitude || ! $company->longitude) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_COMPANY_NOT_CONFIGURED,
                "Koordinat lokasi {$company->name} belum dikonfigurasi admin.", $now
            );
        }

        $distance = GeoCalculator::distanceMeters(
            $latitude, $longitude,
            (float) $company->latitude, (float) $company->longitude
        );
        $allowedRadius = (int) ($company->allowed_radius ?? config('attendance.default_radius', 100));

        // 4. Cegah absensi ganda pada tanggal yang sama.
        if ($this->alreadyAttendedToday($student->id, $today)) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_ALREADY_ATTENDED,
                'Absensi hari ini sudah tercatat.', $now, $distance, $allowedRadius
            );
        }

        // 5. Akurasi GPS harus cukup baik.
        $maxAccuracy = (float) Setting::get('max_gps_accuracy', config('attendance.max_gps_accuracy', 50));
        if ($accuracy > $maxAccuracy) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_GPS_ACCURACY_TOO_LOW,
                "Akurasi GPS {$accuracy} m melebihi batas maksimal {$maxAccuracy} m.", $now,
                $distance, $allowedRadius, self::LOCATION_LOW_ACCURACY
            );
        }

        // 6. Siswa harus berada dalam radius perusahaan.
        if ($distance > $allowedRadius) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_LOCATION_OUTSIDE_RADIUS,
                "Anda berada di luar radius lokasi PKL ({$this->humanDistance($distance)} > {$allowedRadius} m).", $now,
                $distance, $allowedRadius, self::LOCATION_OUTSIDE_RADIUS
            );
        }

        // 7. Validasi jadwal PKL (rentang tanggal penempatan).
        if ($today < $placement->start_date || $today > $placement->end_date) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_OUTSIDE_ATTENDANCE_TIME,
                'Absensi di luar rentang jadwal periode PKL Anda.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED
            );
        }

        // 8. Validasi jendela waktu check-in sesuai jam kerja perusahaan.
        [$timeStatus, $timeFailure] = $this->evaluateCheckInWindow($now, $company);
        if ($timeFailure !== null) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, $timeFailure,
                'Di luar jendela waktu absensi masuk. Hubungi admin bila ada kendala.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED, self::TIME_OUTSIDE_WORKING_HOURS
            );
        }

        $resultStatus = $timeStatus === self::TIME_LATE
            ? self::RESULT_TERLAMBAT
            : self::RESULT_HADIR;

        // Status penyimpanan mengikuti konvensi existing (Hadir/Terlambat).
        $dbStatus = $resultStatus === self::RESULT_TERLAMBAT ? 'Terlambat' : 'Hadir';

        try {
            $saved = DB::transaction(function () use ($student, $company, $now, $today, $dbStatus, $latitude, $longitude, $accuracy, $distance, $allowedRadius, $timeStatus, $resultStatus) {
                $attendance = Attendance::create([
                    'student_id' => $student->id,
                    'date' => $today,
                    'check_in' => $now->format('H:i'),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'location_address' => $company->name.' (Terverifikasi GPS)',
                    'status' => $dbStatus,
                    'server_timestamp' => $now,
                    'gps_accuracy' => $accuracy,
                    'company_latitude' => $company->latitude,
                    'company_longitude' => $company->longitude,
                    'distance_from_company' => $distance,
                    'allowed_radius' => $allowedRadius,
                    'location_status' => self::LOCATION_VERIFIED,
                    'time_status' => $timeStatus,
                ]);

                $this->logAttempt($student, $company, $now, $latitude, $longitude, $accuracy, $distance, $allowedRadius, $resultStatus, null);

                return $attendance;
            });
        } catch (UniqueConstraintViolationException) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_ALREADY_ATTENDED,
                'Absensi hari ini sudah tercatat.', $now, $distance, $allowedRadius, self::LOCATION_VERIFIED
            );
        }

        return [
            'status' => $resultStatus,
            'failure_reason' => null,
            'message' => $resultStatus === self::RESULT_TERLAMBAT
                ? 'Absensi tercatat sebagai terlambat.'
                : 'Absensi berhasil dicatat. Lokasi terverifikasi.',
            'attendance' => $saved,
            'server_timestamp' => $now,
            'server_date' => $today,
            'server_time' => $now->format('H:i:s').' WIB',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'gps_accuracy' => $accuracy,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'latitude' => (float) $company->latitude,
                'longitude' => (float) $company->longitude,
            ],
            'company_latitude' => (float) $company->latitude,
            'company_longitude' => (float) $company->longitude,
            'distance_from_company' => round($distance, 2),
            'allowed_radius' => $allowedRadius,
            'location_status' => self::LOCATION_VERIFIED,
            'time_status' => $timeStatus,
            'action' => self::ACTION_CHECK_IN,
            'code' => $resultStatus,
            'success' => true,
        ];
    }

    /**
     * Proses absensi pulang berbasis GPS. Mirip check-in: jarak, status,
     * dan waktu dihitung ulang sepenuhnya di server.
     */
    public function processCheckOut(Student $student, float $latitude, float $longitude, float $accuracy): array
    {
        $now = now();
        $today = $now->toDateString();

        $placement = $student->placement;
        $company = $placement?->company;

        // 1. Penempatan PKL aktif.
        if (! $placement || $placement->status !== 'Aktif') {
            return $this->reject(
                $student, null, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_STUDENT_NOT_ASSIGNED,
                'Penempatan PKL aktif tidak ditemukan. Hubungi admin Hubin.', $now
            );
        }

        // 2. Perusahaan tujuan.
        if (! $company) {
            return $this->reject(
                $student, null, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_STUDENT_NOT_ASSIGNED,
                'Siswa belum ditempatkan di perusahaan tujuan PKL.', $now
            );
        }

        // 3. Perusahaan terkonfigurasi.
        if (! $company->latitude || ! $company->longitude) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_COMPANY_NOT_CONFIGURED,
                "Koordinat lokasi {$company->name} belum dikonfigurasi admin.", $now
            );
        }

        $distance = GeoCalculator::distanceMeters(
            $latitude, $longitude,
            (float) $company->latitude, (float) $company->longitude
        );
        $allowedRadius = (int) ($company->allowed_radius ?? config('attendance.default_radius', 100));

        // 4. Harus sudah check-in hari ini.
        $attendance = Attendance::where('student_id', $student->id)->where('date', $today)->first();
        if (! $attendance) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_NOT_CHECKED_IN,
                'Anda belum melakukan check-in hari ini.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED
            );
        }

        // 5. Cegah check-out ganda.
        if ($attendance->check_out) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_ALREADY_CHECKED_OUT,
                'Anda sudah melakukan check-out hari ini.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED
            );
        }

        // 6. Akurasi GPS.
        $maxAccuracy = (float) Setting::get('max_gps_accuracy', config('attendance.max_gps_accuracy', 50));
        if ($accuracy > $maxAccuracy) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_GPS_ACCURACY_TOO_LOW,
                "Akurasi GPS {$accuracy} m melebihi batas maksimal {$maxAccuracy} m.", $now,
                $distance, $allowedRadius, self::LOCATION_LOW_ACCURACY
            );
        }

        // 7. Jarak harus dalam radius perusahaan.
        if ($distance > $allowedRadius) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_LOCATION_OUTSIDE_RADIUS,
                "Anda berada di luar radius lokasi PKL ({$this->humanDistance($distance)} > {$allowedRadius} m).", $now,
                $distance, $allowedRadius, self::LOCATION_OUTSIDE_RADIUS
            );
        }

        // 8. Check-out tidak boleh sebelum jam masuk perusahaan.
        $window = config('attendance.check_in_window');
        $startAt = $company->jam_masuk ?: $window['start'];
        $start = Carbon::parse($now->toDateString().' '.$startAt);
        if ($now->lt($start)) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_OUTSIDE_ATTENDANCE_TIME,
                'Di luar jam kerja — belum waktunya check-out.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED, self::TIME_OUTSIDE_WORKING_HOURS
            );
        }

        $saved = DB::transaction(function () use ($student, $now, $distance, $latitude, $longitude, $accuracy, $today) {
            $att = Attendance::where('student_id', $student->id)
                ->where('date', $today)
                ->lockForUpdate()
                ->first();

            if (! $att || $att->check_out) {
                return null;
            }

            $att->check_out = $now->format('H:i');
            $att->check_out_server_timestamp = $now;
            $att->check_out_latitude = $latitude;
            $att->check_out_longitude = $longitude;
            $att->check_out_gps_accuracy = $accuracy;
            $att->check_out_distance_from_company = round($distance, 2);
            $att->save();

            return $att;
        });

        if (! $saved) {
            return $this->reject(
                $student, $company, $latitude, $longitude, $accuracy,
                self::RESULT_DITOLAK, self::FAILURE_ALREADY_CHECKED_OUT,
                'Anda sudah melakukan check-out hari ini.', $now,
                $distance, $allowedRadius, self::LOCATION_VERIFIED
            );
        }

        return [
            'status' => self::RESULT_HADIR,
            'failure_reason' => null,
            'message' => 'Check-out berhasil dicatat. Lokasi terverifikasi.',
            'attendance' => $saved,
            'server_timestamp' => $now,
            'server_date' => $today,
            'server_time' => $now->format('H:i:s').' WIB',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'gps_accuracy' => $accuracy,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'latitude' => (float) $company->latitude,
                'longitude' => (float) $company->longitude,
            ],
            'company_latitude' => (float) $company->latitude,
            'company_longitude' => (float) $company->longitude,
            'distance_from_company' => round($distance, 2),
            'allowed_radius' => $allowedRadius,
            'location_status' => self::LOCATION_VERIFIED,
            'time_status' => self::TIME_ON_TIME,
            'action' => self::ACTION_CHECK_OUT,
            'code' => self::ACTION_CHECK_OUT,
            'success' => true,
        ];
    }

    private function alreadyAttendedToday(int $studentId, string $date): bool
    {
        return Attendance::where('student_id', $studentId)->where('date', $date)->exists();
    }

    /**
     * Jendela waktu check-in mengikuti jam kerja perusahaan (jam_masuk/jam_keluar).
     * Perusahaan tanpa jam kerja memakai konfigurasi global.
     *
     * @return array{?string, ?string} [time_status, failure_reason]
     */
    private function evaluateCheckInWindow(Carbon $now, $company): array
    {
        $window = config('attendance.check_in_window');
        $grace = (int) config('attendance.on_time_grace_minutes', 30);

        $jamMasuk = $company?->jam_masuk;
        $jamKeluar = $company?->jam_keluar;

        $startRaw = $jamMasuk ?: $window['start'];
        $onTimeRaw = $jamMasuk
            ? Carbon::parse($now->toDateString().' '.$jamMasuk)->addMinutes($grace)->format('H:i')
            : $window['on_time_until'];
        $endRaw = $jamKeluar ?: $window['end'];

        $start = Carbon::parse($now->toDateString().' '.$startRaw);
        $onTimeUntil = Carbon::parse($now->toDateString().' '.$onTimeRaw);
        $end = Carbon::parse($now->toDateString().' '.$endRaw);

        // Lindungi konfigurasi invalid (jam keluar sebelum jam masuk).
        if ($end->lte($start)) {
            return [null, self::FAILURE_OUTSIDE_ATTENDANCE_TIME];
        }

        if ($now->lt($start) || $now->gt($end)) {
            return [null, self::FAILURE_OUTSIDE_ATTENDANCE_TIME];
        }

        return [$now->lte($onTimeUntil) ? self::TIME_ON_TIME : self::TIME_LATE, null];
    }

    private function reject(
        Student $student,
        $company,
        float $latitude,
        float $longitude,
        float $accuracy,
        string $result,
        string $reason,
        string $message,
        Carbon $now,
        ?float $distance = null,
        ?int $allowedRadius = null,
        ?string $locationStatus = self::LOCATION_REJECTED,
        ?string $timeStatus = null
    ): array {
        $this->logAttempt($student, $company, $now, $latitude, $longitude, $accuracy, $distance, $allowedRadius, $result, $reason);

        return [
            'status' => $result,
            'failure_reason' => $reason,
            'message' => $message,
            'attendance' => null,
            'server_timestamp' => $now,
            'server_date' => $now->toDateString(),
            'server_time' => $now->format('H:i:s').' WIB',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'gps_accuracy' => $accuracy,
            'company' => $company
                ? [
                    'id' => $company->id,
                    'name' => $company->name,
                    'latitude' => (float) $company->latitude,
                    'longitude' => (float) $company->longitude,
                ]
                : null,
            'company_latitude' => $company?->latitude,
            'company_longitude' => $company?->longitude,
            'distance_from_company' => $distance !== null ? round($distance, 2) : null,
            'allowed_radius' => $allowedRadius,
            'location_status' => $locationStatus,
            'time_status' => $timeStatus,
            'action' => null,
            'code' => $reason,
            'success' => false,
        ];
    }

    private function logAttempt(
        Student $student,
        $company,
        Carbon $serverTimestamp,
        float $latitude,
        float $longitude,
        float $accuracy,
        ?float $distance,
        ?int $allowedRadius,
        string $result,
        ?string $failureReason
    ): void {
        AttendanceAttempt::create([
            'student_id' => $student->id,
            'company_id' => $company?->id,
            'server_timestamp' => $serverTimestamp,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'gps_accuracy' => $accuracy,
            'company_latitude' => $company?->latitude,
            'company_longitude' => $company?->longitude,
            'distance_from_company' => $distance,
            'allowed_radius' => $allowedRadius,
            'result' => $result,
            'failure_reason' => $failureReason,
        ]);
    }

    private function humanDistance(float $meters): string
    {
        return $meters >= 1000
            ? number_format($meters / 1000, 2, ',', '.').' km'
            : round($meters).' m';
    }
}
