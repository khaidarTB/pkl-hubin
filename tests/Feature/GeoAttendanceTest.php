<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\Placement;
use App\Models\Student;
use App\Models\User;
use App\Services\Support\GeoCalculator;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class GeoAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private const COMPANY_LAT = -6.200000;

    private const COMPANY_LNG = 106.816666;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-09-12 07:15:00', 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(null);
        parent::tearDown();
    }

    private function makeStudent(array $companyAttrs = [], array $placementAttrs = []): array
    {
        $user = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa'.uniqid().'@test.dev',
            'role' => 'siswa',
            'password' => Hash::make('password'),
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'nis' => 'NIS'.uniqid(),
            'class' => 'XII RPL',
            'major' => 'RPL',
        ]);

        $company = Company::create(array_merge([
            'name' => 'PT Contoh Teknologi',
            'address' => 'Jl. Contoh No. 1',
            'industry_type' => 'Teknologi',
            'latitude' => self::COMPANY_LAT,
            'longitude' => self::COMPANY_LNG,
            'allowed_radius' => 100,
            'jam_masuk' => '07:00',
            'jam_keluar' => '16:00',
        ], $companyAttrs));

        $placement = Placement::create(array_merge([
            'student_id' => $student->id,
            'company_id' => $company->id,
            'start_date' => Carbon::today()->subDays(10)->toDateString(),
            'end_date' => Carbon::today()->addDays(20)->toDateString(),
            'status' => 'Aktif',
        ], $placementAttrs));

        return compact('user', 'student', 'company', 'placement');
    }

    private function checkinPayload(float $lat = self::COMPANY_LAT, float $lng = self::COMPANY_LNG, float $accuracy = 12): array
    {
        return [
            'latitude' => $lat,
            'longitude' => $lng,
            'accuracy' => $accuracy,
        ];
    }

    // ------------------------------------------------------------------
    //  LOKASI
    // ------------------------------------------------------------------

    public function test_check_in_success_hadir(): void
    {
        ['user' => $user, 'student' => $student, 'company' => $company] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(200)
            ->assertJsonPath('status', 'HADIR')
            ->assertJsonPath('code', 'HADIR')
            ->assertJsonPath('success', true)
            ->assertJsonPath('location_status', 'VERIFIED');

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'date' => '2026-09-12',
            'check_in' => '07:15',
            'status' => 'Hadir',
            'location_status' => 'VERIFIED',
            'time_status' => 'ON_TIME',
        ]);

        $attendance = Attendance::where('student_id', $student->id)->first();
        $expectedDistance = GeoCalculator::distanceMeters(
            self::COMPANY_LAT, self::COMPANY_LNG,
            (float) $company->latitude, (float) $company->longitude
        );
        $this->assertEqualsWithDelta(round($expectedDistance, 2), $attendance->distance_from_company, 0.01);

        $this->assertDatabaseHas('attendance_attempts', [
            'student_id' => $student->id,
            'company_id' => $company->id,
            'result' => 'HADIR',
        ]);
    }

    public function test_check_in_outside_radius_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload(
            lat: self::COMPANY_LAT + 0.005000, // ±556 m dari perusahaan
        ));

        $response->assertStatus(422)
            ->assertJsonPath('status', 'DITOLAK')
            ->assertJsonPath('failure_reason', 'LOCATION_OUTSIDE_RADIUS')
            ->assertJsonPath('location_status', 'OUTSIDE_RADIUS')
            ->assertJsonPath('success', false);
    }

    public function test_check_in_boundary_inside_radius_accepted(): void
    {
        ['user' => $user] = $this->makeStudent();

        // ±89 m (masih dalam radius 100 m).
        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload(
            lat: self::COMPANY_LAT + 0.000800,
        ));

        $response->assertStatus(200)->assertJsonPath('status', 'HADIR');
    }

    public function test_check_in_invalid_latitude_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload(lat: 95.5));

        $response->assertStatus(422)->assertJsonValidationErrors('latitude');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_check_in_invalid_longitude_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload(lng: -190.0));

        $response->assertStatus(422)->assertJsonValidationErrors('longitude');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_check_in_poor_accuracy_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload(accuracy: 250));

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'GPS_ACCURACY_TOO_LOW')
            ->assertJsonPath('location_status', 'LOW_ACCURACY');
    }

    // ------------------------------------------------------------------
    //  PENEMPATAN
    // ------------------------------------------------------------------

    public function test_check_in_without_placement_rejected(): void
    {
        $user = User::create(['name' => 'No Place', 'email' => 'noplace'.uniqid().'@test.dev', 'role' => 'siswa', 'password' => Hash::make('pw')]);
        Student::create(['user_id' => $user->id, 'nis' => 'N'.uniqid(), 'class' => 'XII RPL', 'major' => 'RPL']);

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'STUDENT_NOT_ASSIGNED_TO_COMPANY');
    }

    public function test_check_in_inactive_placement_rejected(): void
    {
        ['user' => $user] = $this->makeStudent([], ['status' => 'Selesai']);

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'STUDENT_NOT_ASSIGNED_TO_COMPANY');
    }

    // ------------------------------------------------------------------
    //  WAKTU & JAM KERJA PERUSAHAAN
    // ------------------------------------------------------------------

    public function test_check_in_late_terlambat(): void
    {
        ['user' => $user] = $this->makeStudent();

        Carbon::setTestNow(Carbon::parse('2026-09-12 08:45:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(200)
            ->assertJsonPath('status', 'TERLAMBAT')
            ->assertJsonPath('code', 'TERLAMBAT');

        $this->assertDatabaseHas('attendances', [
            'student_id' => $user->student->id,
            'status' => 'Terlambat',
            'time_status' => 'LATE',
        ]);
    }

    public function test_check_in_before_work_start_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        Carbon::setTestNow(Carbon::parse('2026-09-12 06:00:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'OUTSIDE_ATTENDANCE_TIME')
            ->assertJsonPath('time_status', 'OUTSIDE_WORKING_HOURS');
    }

    public function test_check_in_after_work_end_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        Carbon::setTestNow(Carbon::parse('2026-09-12 17:00:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'OUTSIDE_ATTENDANCE_TIME');
    }

    public function test_company_work_hours_per_company(): void
    {
        // Perusahaan A jam masuk 07:00, perusahaan B jam masuk 08:00.
        ['user' => $userA] = $this->makeStudent();
        ['user' => $userB] = $this->makeStudent(['jam_masuk' => '08:00', 'jam_keluar' => '17:00']);

        Carbon::setTestNow(Carbon::parse('2026-09-12 07:20:00', 'Asia/Jakarta'));

        // A (07:00 + grace 30 -> on time sampai 07:30) menerima.
        $this->actingAs($userA)->postJson('/absensi/geo-checkin', $this->checkinPayload())
            ->assertStatus(200)
            ->assertJsonPath('status', 'HADIR');

        // B (jam masuk 08:00) belum waktunya -> ditolak.
        $this->actingAs($userB)->postJson('/absensi/geo-checkin', $this->checkinPayload())
            ->assertStatus(422)
            ->assertJsonPath('failure_reason', 'OUTSIDE_ATTENDANCE_TIME');
    }

    public function test_check_in_outside_placement_date_range_rejected(): void
    {
        ['user' => $user] = $this->makeStudent([], [
            'start_date' => Carbon::today()->subDays(30)->toDateString(),
            'end_date' => Carbon::today()->subDays(2)->toDateString(),
        ]);

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'OUTSIDE_ATTENDANCE_TIME');
    }

    // ------------------------------------------------------------------
    //  DUPLIKAT & RACE
    // ------------------------------------------------------------------

    public function test_duplicate_check_in_rejected(): void
    {
        ['user' => $user, 'student' => $student] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload())
            ->assertStatus(200);

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'ALREADY_ATTENDED');

        $this->assertSame(1, Attendance::where('student_id', $student->id)->count());
    }

    // ------------------------------------------------------------------
    //  KEAMANAN / MANIPULASI
    // ------------------------------------------------------------------

    public function test_client_cannot_override_company_radius_distance_or_timestamp(): void
    {
        ['user' => $user, 'student' => $student, 'company' => $company] = $this->makeStudent();

        // Titik valid (di dalam radius, bukan tepat di koordinat perusahaan).
        $lat = self::COMPANY_LAT + 0.000300; // ±33 m
        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', [
            'latitude' => $lat,
            'longitude' => self::COMPANY_LNG,
            'accuracy' => 12,
            'company_id' => 99999,
            'radius' => 999999,
            'allowed_radius' => 999999,
            'distance' => 0,
            'timestamp' => '2020-01-01 00:00:00',
            'jam_masuk' => '09:00',
            'status' => 'Hadir',
        ]);

        $response->assertStatus(200)->assertJsonPath('status', 'HADIR');

        $attendance = Attendance::where('student_id', $student->id)->first();

        // Jarak dihitung ulang oleh server (bukan nilai client 0).
        $expectedDistance = GeoCalculator::distanceMeters(
            $lat, self::COMPANY_LNG,
            (float) $company->latitude, (float) $company->longitude
        );
        $this->assertGreaterThan(0, $attendance->distance_from_company);
        $this->assertEqualsWithDelta(round($expectedDistance, 2), $attendance->distance_from_company, 0.01);

        // Waktu dari server, bukan dari client.
        $this->assertStringStartsWith('2026-09-12', (string) $attendance->server_timestamp);

        // Perusahaan benar-benar dari placement siswa, bukan company_id client.
        $response->assertJsonPath('company.id', $company->id);

        // Radius yang dipakai dari DB.
        $this->assertSame(100, $attendance->allowed_radius);
    }

    public function test_client_cannot_attend_for_another_student(): void
    {
        ['user' => $userA, 'student' => $studentA] = $this->makeStudent();
        $this->makeStudent(); // siswa B dengan company berbeda

        $this->actingAs($userA)->postJson('/absensi/geo-checkin', array_merge(
            $this->checkinPayload(),
            ['student_id' => 99999]
        ))->assertStatus(200);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $studentA->id,
        ]);
        $this->assertDatabaseCount('attendances', 1);
    }

    public function test_non_siswa_cannot_check_in(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin'.uniqid().'@test.dev', 'role' => 'admin', 'password' => Hash::make('pw')]);

        $this->actingAs($admin)->postJson('/absensi/geo-checkin', $this->checkinPayload())
            ->assertStatus(403);

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_student_cannot_view_other_student_attendance(): void
    {
        ['user' => $userA, 'student' => $studentA] = $this->makeStudent();
        ['user' => $userB, 'student' => $studentB] = $this->makeStudent();

        $attendance = Attendance::create([
            'student_id' => $studentB->id,
            'date' => '2026-09-12',
            'check_in' => '07:00',
            'status' => 'Hadir',
        ]);

        $this->actingAs($userA)->get('/absensi/'.$attendance->id)->assertStatus(403);
        $this->actingAs($userB)->get('/absensi/'.$attendance->id)->assertStatus(200);
    }

    // ------------------------------------------------------------------
    //  CHECK-OUT
    // ------------------------------------------------------------------

    public function test_check_out_without_check_in_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $response = $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'NOT_CHECKED_IN');
    }

    public function test_check_out_success(): void
    {
        ['user' => $user, 'student' => $student] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload())
            ->assertStatus(200);

        Carbon::setTestNow(Carbon::parse('2026-09-12 16:05:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload());

        $response->assertStatus(200)
            ->assertJsonPath('status', 'HADIR')
            ->assertJsonPath('action', 'CHECK_OUT')
            ->assertJsonPath('success', true);

        $attendance = Attendance::where('student_id', $student->id)->first();
        $this->assertSame('16:05', $attendance->check_out);
        $this->assertNotNull($attendance->check_out_latitude);
        $this->assertNotNull($attendance->check_out_gps_accuracy);
        $this->assertStringStartsWith('2026-09-12', (string) $attendance->check_out_server_timestamp);
    }

    public function test_duplicate_check_out_rejected(): void
    {
        ['user' => $user, 'student' => $student] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());
        $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload())
            ->assertStatus(200);

        Carbon::setTestNow(Carbon::parse('2026-09-12 16:10:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload());

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'ALREADY_CHECKED_OUT');

        $attendance = Attendance::where('student_id', $student->id)->first();
        $this->assertNotSame('16:10', $attendance->check_out);
    }

    public function test_check_out_outside_radius_rejected_and_record_unchanged(): void
    {
        ['user' => $user, 'student' => $student] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        Carbon::setTestNow(Carbon::parse('2026-09-12 16:00:00', 'Asia/Jakarta'));

        $response = $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload(
            lat: self::COMPANY_LAT + 0.005000,
        ));

        $response->assertStatus(422)
            ->assertJsonPath('failure_reason', 'LOCATION_OUTSIDE_RADIUS')
            ->assertJsonPath('location_status', 'OUTSIDE_RADIUS');

        $attendance = Attendance::where('student_id', $student->id)->first();
        $this->assertNull($attendance->check_out);
    }

    public function test_check_out_poor_accuracy_rejected(): void
    {
        ['user' => $user] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        Carbon::setTestNow(Carbon::parse('2026-09-12 16:00:00', 'Asia/Jakarta'));

        $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload(accuracy: 300))
            ->assertStatus(422)
            ->assertJsonPath('failure_reason', 'GPS_ACCURACY_TOO_LOW');
    }

    public function test_check_out_before_work_start_rejected(): void
    {
        ['user' => $user, 'student' => $student] = $this->makeStudent();

        // Simulasikan data sudah check-in hari ini tanpa memvalidasi ulang.
        Attendance::create([
            'student_id' => $student->id,
            'date' => '2026-09-12',
            'check_in' => '07:00',
            'status' => 'Hadir',
        ]);

        Carbon::setTestNow(Carbon::parse('2026-09-12 05:00:00', 'Asia/Jakarta'));

        $this->actingAs($user)->postJson('/absensi/checkout', $this->checkinPayload())
            ->assertStatus(422)
            ->assertJsonPath('failure_reason', 'OUTSIDE_ATTENDANCE_TIME')
            ->assertJsonPath('time_status', 'OUTSIDE_WORKING_HOURS');
    }

    public function test_check_out_after_check_in_without_geo_rejections(): void
    {
        ['user' => $user] = $this->makeStudent();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', $this->checkinPayload());

        // Client mengirim data tamper untuk checkout.
        $this->actingAs($user)->postJson('/absensi/checkout', array_merge(
            $this->checkinPayload(),
            ['company_id' => 1, 'radius' => 900000, 'timestamp' => '2019-05-05']
        ))->assertStatus(200);
    }
}
