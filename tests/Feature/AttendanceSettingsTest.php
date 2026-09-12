<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Placement;
use App\Models\Setting;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AttendanceSettingsTest extends TestCase
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

    private function makeAdmin(): User
    {
        return User::create(['name' => 'Admin', 'email' => 'admin'.uniqid().'@test.dev', 'role' => 'admin', 'password' => Hash::make('pw')]);
    }

    private function makeStudentWithoutAdmin(): User
    {
        $user = User::create(['name' => 'Siswa', 'email' => 'siswa'.uniqid().'@test.dev', 'role' => 'siswa', 'password' => Hash::make('pw')]);
        $student = Student::create(['user_id' => $user->id, 'nis' => 'N'.uniqid(), 'class' => 'XII', 'major' => 'RPL']);
        $company = Company::create([
            'name' => 'PT Uji Akurasi',
            'address' => 'Jl. Uji No. 1',
            'industry_type' => 'Teknologi',
            'latitude' => self::COMPANY_LAT,
            'longitude' => self::COMPANY_LNG,
            'allowed_radius' => 100,
            'jam_masuk' => '07:00',
            'jam_keluar' => '16:00',
        ]);
        Placement::create([
            'student_id' => $student->id,
            'company_id' => $company->id,
            'start_date' => Carbon::today()->subDays(10)->toDateString(),
            'end_date' => Carbon::today()->addDays(20)->toDateString(),
            'status' => 'Aktif',
        ]);

        return $user;
    }

    public function test_admin_can_update_max_gps_accuracy_via_ui(): void
    {
        Setting::set('max_gps_accuracy', 100);

        $this->actingAs($this->makeAdmin())
            ->get('/admin/pengaturan-absensi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('settings.max_gps_accuracy', 100));

        $this->actingAs($this->makeAdmin())
            ->put('/admin/pengaturan-absensi', ['max_gps_accuracy' => 500])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertSame('500', Setting::get('max_gps_accuracy'));
    }

    public function test_invalid_accuracy_rejected(): void
    {
        $this->actingAs($this->makeAdmin())
            ->put('/admin/pengaturan-absensi', ['max_gps_accuracy' => 5])
            ->assertSessionHasErrors('max_gps_accuracy');
    }

    public function test_student_page_reflects_updated_accuracy_setting(): void
    {
        Setting::set('max_gps_accuracy', 500);

        $this->actingAs($this->makeStudentWithoutAdmin())
            ->get('/absensi')
            ->assertInertia(fn ($page) => $page->where('config.maxGpsAccuracy', 500));
    }

    public function test_poor_gps_accuracy_accepted_when_admin_raises_limit(): void
    {
        Setting::set('max_gps_accuracy', 500);

        $user = $this->makeStudentWithoutAdmin();

        $response = $this->actingAs($user)->postJson('/absensi/geo-checkin', [
            'latitude' => self::COMPANY_LAT,
            'longitude' => self::COMPANY_LNG,
            'accuracy' => 250,
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'HADIR');
    }

    public function test_poor_gps_accuracy_still_rejected_with_default_limit(): void
    {
        Setting::set('max_gps_accuracy', 50);

        $user = $this->makeStudentWithoutAdmin();

        $this->actingAs($user)->postJson('/absensi/geo-checkin', [
            'latitude' => self::COMPANY_LAT,
            'longitude' => self::COMPANY_LNG,
            'accuracy' => 250,
        ])->assertStatus(422)->assertJsonPath('failure_reason', 'GPS_ACCURACY_TOO_LOW');
    }
}