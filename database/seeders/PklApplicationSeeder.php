<?php

namespace Database\Seeders;

use App\Models\PklApplication;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class PklApplicationSeeder extends Seeder
{
    public function run(): void
    {
        PklApplication::query()->delete();

        $students = Student::orderBy('id')->get();
        $students = $students->values();
        $admin = User::where('role', 'admin')->first();
        $companies = \App\Models\Company::orderBy('id')->get();
        $activePeriod = \App\Models\PklPeriod::where('status', 'active')->first();
        $completedPeriod = \App\Models\PklPeriod::where('status', 'completed')->first();

        // Pembagian status aplikasi (30 siswa)
        // approved 16, under_review 3, submitted 4, revision 3, rejected 2, draft 2
        $statuses = [
            'approved', 'approved', 'approved', 'approved', 'approved',
            'approved', 'approved', 'approved', 'approved', 'approved',
            'approved', 'approved', 'approved', 'approved', 'approved',
            'approved',
            'under_review', 'under_review', 'under_review',
            'submitted', 'submitted', 'submitted', 'submitted',
            'revision', 'revision', 'revision',
            'rejected', 'rejected',
            'draft', 'draft',
        ];

        $fields = [
            ['Teknik Komputer dan Jaringan', 'Teknisi Jaringan'],
            ['Rekayasa Perangkat Lunak', 'Web Developer'],
            ['Rekayasa Perangkat Lunak', 'Mobile Developer'],
            ['Akuntansi dan Keuangan Lembaga', 'Staff Administrasi'],
            ['Bisnis Daring dan Pemasaran', 'Digital Marketing'],
            ['Teknik Komputer dan Jaringan', 'Network Administrator'],
            ['Rekayasa Perangkat Lunak', 'UI/UX Designer'],
            ['Akuntansi dan Keuangan Lembaga', 'Staff Keuangan'],
            ['Bisnis Daring dan Pemasaran', 'Content Creator'],
            ['Teknik Komputer dan Jaringan', 'IT Support'],
        ];

        foreach ($students as $index => $student) {
            $status = $statuses[$index % count($statuses)];
            $company = $companies[$index % $companies->count()];
            $period = $index % 2 === 0 ? $activePeriod : $completedPeriod;

            $data = [
                'student_id' => $student->id,
                'company_id' => $company->id,
                'pkl_period_id' => $period->id,
                'company_name' => $company->name,
                'company_address' => $company->address,
                'field_of_work' => $fields[$index % count($fields)][0],
                'desired_position' => $fields[$index % count($fields)][1],
                'cv_file' => 'uploads/cv/cv-' . $student->nis . '.pdf',
                'cover_letter_file' => 'uploads/cover/cover-' . $student->nis . '.pdf',
                'additional_file' => null,
                'status' => $status,
            ];

            if (in_array($status, ['approved', 'under_review', 'revision', 'rejected'])) {
                $data['reviewed_by'] = $admin->id;
                $data['reviewed_at'] = now()->subDays(rand(3, 20));
            }

            if ($status !== 'draft') {
                $data['submitted_at'] = now()->subDays(rand(25, 45));
            }

            if ($status === 'revision') {
                $data['revision_note'] = 'Mohon perbaiki data perusahaan tujuan PKL. Detail alamat dan nama pembimbing di industri perlu dilengkapi.';
            }

            if ($status === 'rejected') {
                $data['rejection_reason'] = 'Kuota sudah penuh untuk periode aktif. Silakan pilih perusahaan lain pada periode berikutnya.';
            }

            PklApplication::create($data);
        }
    }
}
