<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::query()->delete();

        $companies = [
            [
                'name' => 'PT Digital Nusantara',
                'address' => 'Jl. Sudirman Kav. 25, Jakarta Selatan',
                'city' => 'Jakarta',
                'phone' => '021-5234567',
                'email' => 'humas@digitalnusantara.co.id',
                'website' => 'www.digitalnusantara.co.id',
                'industry_type' => 'Technology',
                'logo' => null,
                'description' => 'Perusahaan pengembang solusi teknologi informasi dan digital untuk berbagai sektor industri.',
                'supervisor_name' => 'Andi Firmansyah',
                'partnership_status' => 'active',
                'student_quota' => 15,
            ],
            [
                'name' => 'PT Karya Teknologi Indonesia',
                'address' => 'Jl. Gatot Subroto No. 12, Bandung',
                'city' => 'Bandung',
                'phone' => '022-7212345',
                'email' => 'info@karyateknologi.co.id',
                'website' => 'www.karyateknologi.co.id',
                'industry_type' => 'Software Development',
                'logo' => null,
                'description' => 'Pengembang aplikasi web dan mobile serta layanan IT konsultasi.',
                'supervisor_name' => 'Siti Marlina',
                'partnership_status' => 'active',
                'student_quota' => 20,
            ],
            [
                'name' => 'PT Bank Central Asia',
                'address' => 'Jl. M.H. Thamrin No. 1, Jakarta Pusat',
                'city' => 'Jakarta',
                'phone' => '021-23556789',
                'email' => 'hc@bca.co.id',
                'website' => 'www.bca.co.id',
                'industry_type' => 'Financial Services',
                'logo' => null,
                'description' => 'Salah satu bank swasta terbesar di Indonesia dengan layanan perbankan digital.',
                'supervisor_name' => 'Hendra Wijaya',
                'partnership_status' => 'active',
                'student_quota' => 25,
            ],
            [
                'name' => 'PT Graha Media Nusantara',
                'address' => 'Jl. Raya Darmo Permai III, Surabaya',
                'city' => 'Surabaya',
                'phone' => '031-56789012',
                'email' => 'contact@grahamedianusantara.co.id',
                'website' => 'www.grahamedianusantara.co.id',
                'industry_type' => 'Media & Broadcasting',
                'logo' => null,
                'description' => 'Perusahaan media digital, periklanan, dan produksi konten kreatif.',
                'supervisor_name' => 'Rizky Pratama',
                'partnership_status' => 'active',
                'student_quota' => 10,
            ],
            [
                'name' => 'CV Maju Jaya Komputer',
                'address' => 'Jl. Melati No. 88, Yogyakarta',
                'city' => 'Yogyakarta',
                'phone' => '0274-512345',
                'email' => 'cs@majujayakomputer.co.id',
                'website' => 'www.majujayakomputer.co.id',
                'industry_type' => 'Computer Sales & Service',
                'logo' => null,
                'description' => 'Toko dan service center komputer serta penyedia layanan jaringan.',
                'supervisor_name' => 'Nurhaliza Putri',
                'partnership_status' => 'active',
                'student_quota' => 8,
            ],
            [
                'name' => 'PT Rumah Sakit Harapan Sehat',
                'address' => 'Jl. Hayam Wuruk No. 45, Jakarta Barat',
                'city' => 'Jakarta',
                'phone' => '021-5551234',
                'email' => 'info@rsharapansehat.co.id',
                'website' => 'www.rsharapansehat.co.id',
                'industry_type' => 'Healthcare',
                'logo' => null,
                'description' => 'Rumah sakit umum dengan layanan administrasi dan SIMRS.',
                'supervisor_name' => 'Bayu Anggoro',
                'partnership_status' => 'pending',
                'student_quota' => 5,
            ],
            [
                'name' => 'PT Bali Digital Creative',
                'address' => 'Jl. Raya Kuta No. 123, Kuta, Bali',
                'city' => 'Denpasar',
                'phone' => '0361-7654321',
                'email' => 'hello@balidigitalcreative.co.id',
                'website' => 'www.balidigitalcreative.co.id',
                'industry_type' => 'Creative & Design',
                'logo' => null,
                'description' => 'Studio kreatif yang fokus pada desain grafis, branding, dan produksi video.',
                'supervisor_name' => 'Made Wira',
                'partnership_status' => 'active',
                'student_quota' => 12,
            ],
            [
                'name' => 'PT Semarang Automotif',
                'address' => 'Jl. Pandanaran No. 77, Semarang',
                'city' => 'Semarang',
                'phone' => '024-3554321',
                'email' => 'admin@semarangautomotif.co.id',
                'website' => 'www.semarangautomotif.co.id',
                'industry_type' => 'Manufacturing',
                'logo' => null,
                'description' => 'Perusahaan manufaktur komponen otomotif dengan standar internasional.',
                'supervisor_name' => 'Dedy Kurniawan',
                'partnership_status' => 'inactive',
                'student_quota' => 6,
            ],
        ];

        foreach ($companies as $company) {
            Company::create($company);
        }
    }
}
