<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginHardRefreshTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'role' => 'siswa',
            'password' => Hash::make('password123'),
        ]);
    }

    public function test_inertia_login_success_returns_location_for_hard_refresh(): void
    {
        $user = $this->makeUser();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ], [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => '',
        ]);

        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_inertia_login_success_uses_intended_url_when_present(): void
    {
        $user = $this->makeUser();

        $target = route('dokumen.index');
        $this->withSession(['url.intended' => $target]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ], [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => '',
        ]);

        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', $target);
    }

    public function test_non_inertia_login_success_still_redirects(): void
    {
        $user = $this->makeUser();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_failed_login_returns_validation_errors(): void
    {
        $this->makeUser();

        $response = $this->post('/login', [
            'email' => 'salah@example.com',
            'password' => 'salah',
        ], [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => '',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
