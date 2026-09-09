<?php

namespace Database\Seeders;

use App\Models\Industry;
use Illuminate\Database\Seeder;

class IndustrySeeder extends Seeder
{
    public function run(): void
    {
        Industry::query()->delete();

        $industries = [
            [
                'name' => 'PT Digital Nusantara',
                'address' => 'Jl. Sudirman Kav. 25, Jakarta Selatan',
                'phone' => '021-5234567',
                'email' => 'humas@digitalnusantara.co.id',
                'supervisor_name' => 'Andi Firmansyah',
            ],
            [
                'name' => 'PT Karya Teknologi Indonesia',
                'address' => 'Jl. Gatot Subroto No. 12, Bandung',
                'phone' => '022-7212345',
                'email' => 'info@karyateknologi.co.id',
                'supervisor_name' => 'Siti Marlina',
            ],
            [
                'name' => 'PT Bank Central Asia',
                'address' => 'Jl. M.H. Thamrin No. 1, Jakarta Pusat',
                'phone' => '021-23556789',
                'email' => 'hc@bca.co.id',
                'supervisor_name' => 'Hendra Wijaya',
            ],
            [
                'name' => 'PT Graha Media Nusantara',
                'address' => 'Jl. Raya Darmo Permai III, Surabaya',
                'phone' => '031-56789012',
                'email' => 'contact@grahamedianusantara.co.id',
                'supervisor_name' => 'Rizky Pratama',
            ],
            [
                'name' => 'CV Maju Jaya Komputer',
                'address' => 'Jl. Melati No. 88, Yogyakarta',
                'phone' => '0274-512345',
                'email' => 'cs@majujayakomputer.co.id',
                'supervisor_name' => 'Nurhaliza Putri',
            ],
        ];

        foreach ($industries as $industry) {
            Industry::create($industry);
        }
    }
}
