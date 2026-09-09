<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        Document::query()->delete();

        $suratTugasTemplate = DocumentTemplate::where('type', 'surat_tugas')->first();
        $suratJalanTemplate = DocumentTemplate::where('type', 'surat_jalan')->first();
        $completedVisits = Visit::where('status', 'completed')->get();
        $scheduledVisits = Visit::where('status', 'scheduled')->get();

        $admin = \App\Models\User::where('role', 'admin')->first();

        // Surat tugas untuk kunjungan yang sudah selesai (final)
        foreach ($completedVisits->take(4) as $index => $visit) {
            $guru = $visit->teacher;
            $student = $visit->student;
            $company = $visit->company;
            $documentNumber = 'PKL/SMK-TB/' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT) . '/2026';

            $document = Document::create([
                'template_id' => $suratTugasTemplate->id,
                'visit_id' => $visit->id,
                'title' => 'Surat Tugas Monitoring PKL ' . $student->user->name,
                'type' => 'surat_tugas',
                'document_number' => $documentNumber,
                'generated_file_path' => "documents/generated/surat-tugas-{$visit->id}.pdf",
                'data' => [
                    'no_surat' => $documentNumber,
                    'nama_guru' => $guru->name,
                    'nip' => '199203152019031004',
                    'nama_sekolah' => 'SMK Teknologi Bangsa',
                    'nama_siswa' => $student->user->name,
                    'nama_perusahaan' => $company->name,
                    'tanggal_kunjungan' => $visit->visit_date,
                    'tujuan' => $visit->purpose,
                    'tempat' => $company->city,
                ],
                'status' => 'final',
                'created_by' => $admin->id,
            ]);
        }

        // Surat tugas untuk kunjungan terjadwal (draft)
        if ($scheduledVisits->isNotEmpty()) {
            foreach ($scheduledVisits->take(2) as $index => $visit) {
                $guru = $visit->teacher;
                $student = $visit->student;
                $company = $visit->company;
                $documentNumber = 'PKL/SMK-TB/' . str_pad((string)(5 + $index), 3, '0', STR_PAD_LEFT) . '/2026';

                Document::create([
                    'template_id' => $suratTugasTemplate->id,
                    'visit_id' => $visit->id,
                    'title' => 'Surat Tugas Monitoring PKL ' . $student->user->name,
                    'type' => 'surat_tugas',
                    'document_number' => $documentNumber,
                    'generated_file_path' => "documents/generated/draft-surat-tugas-{$visit->id}.docx",
                    'data' => [
                        'no_surat' => $documentNumber,
                        'nama_guru' => $guru->name,
                        'nip' => '199203152019031004',
                        'nama_sekolah' => 'SMK Teknologi Bangsa',
                        'nama_siswa' => $student->user->name,
                        'nama_perusahaan' => $company->name,
                        'tanggal_kunjungan' => $visit->visit_date,
                        'tujuan' => $visit->purpose,
                        'tempat' => $company->city,
                    ],
                    'status' => 'draft',
                    'created_by' => $admin->id,
                ]);
            }
        }

        // Surat permohonan PKL (menggunakan template surat_jalan)
        if ($suratJalanTemplate) {
            foreach ($completedVisits->take(2) as $index => $visit) {
                $student = $visit->student;
                $company = $visit->company;
                $documentNumber = 'PKL/SMK-TB/' . str_pad((string)(7 + $index), 3, '0', STR_PAD_LEFT) . '/2026';

                Document::create([
                    'template_id' => $suratJalanTemplate->id,
                    'visit_id' => $visit->id,
                    'title' => 'Surat Permohonan PKL ' . $student->user->name,
                    'type' => 'surat_jalan',
                    'document_number' => $documentNumber,
                    'generated_file_path' => "documents/generated/surat-permohonan-pkl-{$visit->id}.pdf",
                    'data' => [
                        'no_surat' => $documentNumber,
                        'nama_headmaster' => 'Bambang Sugianto, M.Pd.',
                        'nip' => '197205152001121001',
                        'nama_sekolah' => 'SMK Teknologi Bangsa',
                        'nama_siswa' => $student->user->name,
                        'nama_perusahaan' => $company->name,
                        'alamat_perusahaan' => $company->address,
                        'durasi' => '3 bulan',
                    ],
                    'status' => 'final',
                    'created_by' => $admin->id,
                ]);
            }
        }
    }
}
