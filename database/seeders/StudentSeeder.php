<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::query()->delete();

        $siswaUsers = User::where('role', 'siswa')->orderBy('id')->get();

        $majors = ['Teknik Komputer dan Jaringan', 'Rekayasa Perangkat Lunak', 'Akuntansi dan Keuangan Lembaga', 'Bisnis Daring dan Pemasaran'];
        $classes = ['XI TKJ 1', 'XI TKJ 2', 'XI RPL 1', 'XI RPL 2', 'XII AKL 1', 'XII AKL 2', 'XI BDP 1', 'XII BDP 1'];

        foreach ($siswaUsers as $index => $user) {
            $major = $majors[$index % 4];

            // Buat NIS unik (2 digit tahun + 3 digit urutan)
            $nis = '2024' . str_pad((string)($index + 1), 4, '0', STR_PAD_LEFT);

            $phone = '08' . str_pad((string)mt_rand(1000000000, 9999999999), 10, '0', STR_PAD_LEFT);

            Student::create([
                'user_id' => $user->id,
                'nis' => $nis,
                'class' => $classes[$index % count($classes)],
                'major' => $major,
                'phone' => $phone,
                'photo' => null,
            ]);
        }
    }
}
