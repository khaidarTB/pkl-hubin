<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompanyUpdateReproTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_update_company_geo_radius_and_jam(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'a'.uniqid().'@t.dev', 'role' => 'admin', 'password' => Hash::make('pw')]);

        $company = Company::create([
            'name' => 'PT A',
            'address' => 'Jl A',
            'industry_type' => 'Teknologi',
            'latitude' => -6.2,
            'longitude' => 106.8,
            'allowed_radius' => 100,
        ]);

        $student = Student::create([
            'user_id' => User::create(['name' => 'S', 'email' => 's'.uniqid().'@t.dev', 'role' => 'siswa', 'password' => Hash::make('pw')])->id,
            'nis' => 'N'.uniqid(),
            'class' => 'XII',
            'major' => 'RPL',
        ]);

        $student->placement()->create([
            'company_id' => $company->id,
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'status' => 'Aktif',
        ]);

        // Update persis seperti payload form React (Inertia PUT).
        $response = $this->actingAs($admin)->put('/admin/perusahaan/'.$company->id, [
            'name' => 'PT A',
            'address' => 'Jl A',
            'industry_type' => 'Teknologi',
            'student_quota' => 10,
            'latitude' => -6.210000,
            'longitude' => 106.820000,
            'allowed_radius' => 250,
            'jam_masuk' => '08:00',
            'jam_keluar' => '17:00',
            'partnership_status' => 'active',
        ]);

        $response->assertSessionHasNoErrors();

        $company->refresh();
        $this->assertSame('08:00', $company->jam_masuk);
        $this->assertSame('17:00', $company->jam_keluar);
        $this->assertSame(250, $company->allowed_radius);
        $this->assertEqualsWithDelta(-6.21, (float) $company->latitude, 0.0001);

        // Round-trip MySQL TIME: kolom menyimpan 'H:i:s', model membaca 'H:i'.
        $this->assertSame('08:00', $company->getAttribute('jam_masuk'));
        $this->assertSame('17:00', $company->getAttribute('jam_keluar'));

        // Resubmit dengan nilai ber-detik (persis nilai yang dibaca DB) tidak boleh ditolak.
        $this->actingAs($admin)->put('/admin/perusahaan/'.$company->id, [
            'name' => 'PT A',
            'address' => 'Jl A',
            'industry_type' => 'Teknologi',
            'student_quota' => 10,
            'latitude' => -6.210000,
            'longitude' => 106.820000,
            'allowed_radius' => 250,
            'jam_masuk' => '08:00:00',
            'jam_keluar' => '17:00:00',
            'partnership_status' => 'active',
        ])->assertSessionHasNoErrors();

        $company->refresh();
        $this->assertSame('08:00', $company->getAttribute('jam_masuk'));
        $this->assertSame('17:00', $company->getAttribute('jam_keluar'));

        // Siswa membaca data perusahaan dari placement -> company.
        $this->actingAs($student->user)->get('/absensi')
            ->assertInertia(fn ($page) => $page
                ->where('company.allowed_radius', 250)
                ->where('company.jam_masuk', '08:00')
                ->where('company.latitude', -6.21)
            );
    }
}
