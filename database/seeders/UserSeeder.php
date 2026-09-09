<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->delete();

        $users = [
            // Admin Hubin
            ['name' => 'Bambang Sugianto, M.Pd.', 'email' => 'admin@pklconnect.test', 'role' => 'admin'],
            ['name' => 'Drs. Hendra Gunawan, M.Pd.', 'email' => 'admin2@pklconnect.test', 'role' => 'admin'],
            ['name' => 'Sri Wahyuni, S.Pd., M.M.', 'email' => 'admin3@pklconnect.test', 'role' => 'admin'],

            // Guru Pembimbing
            ['name' => 'Dra. Endang Rahayu, M.T.', 'email' => 'guru@pklconnect.test', 'role' => 'guru'],
            ['name' => 'Drs. Agus Supriyanto', 'email' => 'guru1@pklconnect.test', 'role' => 'guru'],
            ['name' => 'Rina Kusuma, S.Kom.', 'email' => 'guru2@pklconnect.test', 'role' => 'guru'],
            ['name' => 'Budi Hartono, S.T.', 'email' => 'guru3@pklconnect.test', 'role' => 'guru'],
            ['name' => 'Dewi Lestari, S.Pd.', 'email' => 'guru4@pklconnect.test', 'role' => 'guru'],
            ['name' => 'Eko Prasetyo, S.Kom.', 'email' => 'guru5@pklconnect.test', 'role' => 'guru'],

            // Pembimbing Industri (DUDI)
            ['name' => 'Hendra Wijaya', 'email' => 'industri@pklconnect.test', 'role' => 'industri'],
            ['name' => 'Andi Firmansyah', 'email' => 'industri1@pklconnect.test', 'role' => 'industri'],
            ['name' => 'Siti Marlina', 'email' => 'industri2@pklconnect.test', 'role' => 'industri'],
            ['name' => 'Rizky Pratama', 'email' => 'industri3@pklconnect.test', 'role' => 'industri'],
            ['name' => 'Nurhaliza Putri', 'email' => 'industri4@pklconnect.test', 'role' => 'industri'],

            // Siswa (30)
            ['name' => 'Budi Santoso', 'email' => 'siswa@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Siti Rahayu', 'email' => 'siswa1@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Ahmad Fauzi', 'email' => 'siswa2@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Dewi Anggraini', 'email' => 'siswa3@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Rizky Ramadhan', 'email' => 'siswa4@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Putri Ayu', 'email' => 'siswa5@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Andi Saputra', 'email' => 'siswa6@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Nur Aini', 'email' => 'siswa7@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Bayu Pratama', 'email' => 'siswa8@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Laila Fitriani', 'email' => 'siswa9@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Dimas Prasetyo', 'email' => 'siswa10@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Rina Marlina', 'email' => 'siswa11@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Fajar Nugroho', 'email' => 'siswa12@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Salsa Bilah', 'email' => 'siswa13@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Galih Saputra', 'email' => 'siswa14@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Intan Permata', 'email' => 'siswa15@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Hadi Wibowo', 'email' => 'siswa16@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Yuni Astuti', 'email' => 'siswa17@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Ivan Kurniawan', 'email' => 'siswa18@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Zahra Amelia', 'email' => 'siswa19@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Joko Susilo', 'email' => 'siswa20@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Maya Puspita', 'email' => 'siswa21@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Rendra Adityo', 'email' => 'siswa22@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Alya Rahmadani', 'email' => 'siswa23@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Tegar Firmansyah', 'email' => 'siswa24@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Cindy Larasati', 'email' => 'siswa25@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Febri Setiawan', 'email' => 'siswa26@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Gita Nirmala', 'email' => 'siswa27@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Hafiz Ramadhani', 'email' => 'siswa28@pklconnect.test', 'role' => 'siswa'],
            ['name' => 'Indah Safitri', 'email' => 'siswa29@pklconnect.test', 'role' => 'siswa'],
            
        ];

        foreach ($users as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'password' => Hash::make('password'),
            ]);
        }
    }
}
