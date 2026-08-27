<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin Hubin
        User::create([
            'name' => 'Bambang Sugianto, M.Pd.',
            'email' => 'admin@pklconnect.test',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        // Guru Pembimbing
        User::create([
            'name' => 'Dra. Endang Rahayu, M.T.',
            'email' => 'guru@pklconnect.test',
            'role' => 'guru',
            'password' => Hash::make('password'),
        ]);

        // Pembimbing Industri
        User::create([
            'name' => 'Hendra Wijaya',
            'email' => 'industri@pklconnect.test',
            'role' => 'industri',
            'password' => Hash::make('password'),
        ]);

       User::create([
            'name' => 'Hendra Wijaya',
            'email' => 'industri@pklconnect.test',
            'role' => 'siswa',
            'password' => Hash::make('password'),
        ]);
    }
}
