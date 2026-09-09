<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentTemplateSeeder extends Seeder
{
    public function run(): void
    {
        DocumentTemplate::query()->delete();

        $admin = User::where('role', 'admin')->first();

        $templates = [
            [
                'name' => 'Surat Tugas Monitoring PKL',
                'description' => 'Surat tugas untuk guru pembimbing dalam melakukan kunjungan monitoring PKL siswa.',
                'type' => 'surat_tugas',
                'file_path' => 'templates/surat_tugas_monitoring.docx',
                'placeholders' => [
                    'no_surat', 'nama_guru', 'nip', 'nama_sekolah', 'nama_siswa',
                    'nama_perusahaan', 'tanggal_kunjungan', 'tujuan', 'tempat', 'tanggal',
                ],
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Surat Permohonan PKL',
                'description' => 'Surat pengantar dari sekolah untuk memohon pelaksanaan PKL di perusahaan.',
                'type' => 'surat_jalan',
                'file_path' => 'templates/surat_permohonan_pkl.docx',
                'placeholders' => [
                    'no_surat', 'nama_headmaster', 'nip', 'nama_sekolah', 'nama_siswa',
                    'nama_perusahaan', 'alamat_perusahaan', 'durasi', 'tanggal',
                ],
                'uploaded_by' => $admin->id,
            ],
            [
                'name' => 'Surat Keterangan Selesai PKL',
                'description' => 'Surat keterangan bahwa siswa telah menyelesaikan program PKL di perusahaan.',
                'type' => 'other',
                'file_path' => 'templates/surat_keterangan_selesai_pkl.docx',
                'placeholders' => [
                    'no_surat', 'nama_perusahaan', 'nama_siswa', 'nis', 'periode', 'tanggal',
                ],
                'uploaded_by' => $admin->id,
            ],
        ];

        foreach ($templates as $template) {
            DocumentTemplate::create($template);
        }
    }
}
