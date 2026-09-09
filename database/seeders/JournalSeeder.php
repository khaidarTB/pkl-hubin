<?php

namespace Database\Seeders;

use App\Models\Journal;
use App\Models\Placement;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class JournalSeeder extends Seeder
{
    public function run(): void
    {
        Journal::query()->delete();

        $activePlacements = Placement::where('status', 'Aktif')->get();
        $guruSupervisors = User::where('role', 'guru')->orderBy('id')->get();

        $activities = [
            ['Menginput data pelanggan ke sistem', 'Melakukan input data pelanggan baru melalui aplikasi dan memvalidasi kebenaran data.', 'Penggunaan aplikasi komputer', 'Data ganda ditemukan di sistem', 'Melaporkan dan meminta admin untuk membersihkan duplikasi data'],
            ['Maintenance jaringan komputer', 'Melakukan pengecekan dan perbaikan instalasi jaringan LAN di kantor cabang.', 'Perawatan jaringan komputer', 'Kabel LAN yang terputus di ruang server', 'Mengganti kabel dan melakukan tes koneksi ulang'],
            ['Membuat halaman landing page', 'Mengembangkan landing page untuk produk baru perusahaan menggunakan HTML, CSS, dan JavaScript.', 'Pengembangan web front-end', 'Responsive layout kurang optimal di mobile', 'Menggunakan CSS media query dan framework Tailwind'],
            ['Melakukan rekonsiliasi laporan keuangan', 'Menghitung dan mencocokkan data transaksi keuangan antara catatan internal dan bank.', 'Akuntansi dan analisis keuangan', 'Perbedaan jumlah antara dua sumber data', 'Menelusuri dan mencari bukti transaksi yang belum masuk'],
            ['Membuat konten media sosial', 'Membuat konten visual dan copywriting untuk promosi produk di Instagram dan TikTok.', 'Marketing digital dan editing', 'Jadwal konten bentrok dengan tim lain', 'Berkoordinasi dan menyusun ulang jadwal konten'],
            ['Instalasi dan konfigurasi server', 'Melakukan instalasi OS server dan konfigurasi layanan dasar seperti DNS dan DHCP.', 'Administrasi server', 'Konfigurasi IP statis salah', 'Baca ulang dokumentasi dan perbaiki konfigurasi'],
            ['Testing dan debugging aplikasi', 'Melakukan pengujian fungsionalitas aplikasi dan memperbaiki bug yang ditemukan.', 'Quality assurance software', 'Bug pada modul pembayaran', 'Menulis kasus uji dan melaporkan ke tim developer'],
            ['Membuat laporan kas harian', 'Menyusun laporan kas masuk dan keluar harian berdasarkan bukti transaksi.', 'Akuntansi kas', 'Ada selisih kas kecil', 'Melakukan pengecekan ulang dan membuat catatan penyesuaian'],
            ['Mengelola toko online', 'Mengelola katalog produk, harga, dan stok di marketplace.', 'E-commerce management', 'Stok produk tidak sinkron', 'Menyinkronkan ulang data stok melalui dashboard'],
            ['Perakitan dan service komputer', 'Melakukan perakitan PC baru dan perawatan komputer klien.', 'Perakitan hardware komputer', 'Komponen RAM tidak terdeteksi', 'Membersihkan slot RAM dan memasang ulang dengan benar'],
            ['Membuat desain logo dan poster', 'Membuat desain visual untuk kebutuhan branding klien menggunakan tools desain grafis.', 'Desain grafis', 'Kesulitan memadukan warna', 'Studi referensi warna dan revisi desain'],
            ['Backup dan restore database', 'Melakukan backup rutin database dan simulasi restore untuk memastikan data aman.', 'Administrasi database', 'Waktu backup lebih lama dari target', 'Menggunakan metode incremental backup'],
        ];

        $skills = [
            'Microsoft Office, pemahaman database',
            'Jaringan komputer, troubleshooting',
            'HTML, CSS, JavaScript, Tailwind',
            'Rekonsiliasi, spreadsheet',
            'Canva, CapCut, copywriting',
            'Linux, Windows Server, DNS, DHCP',
            'Testing, debugging, SDLC',
            'Akuntansi, spreadsheet',
            'Manajemen marketplace, logistik',
            'Perakitan PC, instalasi hardware',
            'Adobe Illustrator, Photoshop, Figma',
            'MySQL, backup, optimasi',
        ];

        $statuses = ['Approved', 'Approved', 'Menunggu Approval', 'Revision', 'Approved', 'Approved', 'Menunggu Approval', 'Approved'];

        $index = 0;
        foreach ($activePlacements as $placement) {
            $studentId = $placement->student_id;
            $guru = $guruSupervisors[$index % $guruSupervisors->count()];
            $index++;

            // Buat 4 jurnal untuk setiap siswa aktif, dimulai 4-8 hari yang lalu
            for ($j = 0; $j < 4; $j++) {
                $daysAgo = 8 - ($j * 2);
                $activity = $activities[($placement->id + $j) % count($activities)];
                $status = $statuses[$j];

                Journal::create([
                    'student_id' => $studentId,
                    'date' => now()->subDays($daysAgo)->toDateString(),
                    'activity' => $activity[0],
                    'description' => $activity[1],
                    'skill' => $activity[2],
                    'obstacle' => $activity[3],
                    'solution' => $activity[4],
                    'status' => $status,
                    'approved_by' => $status === 'Approved' ? $guru->id : null,
                    'approved_at' => $status === 'Approved' ? now()->subDays($daysAgo - 1)->toDateTimeString() : null,
                    'revision_note' => $status === 'Revision' ? 'Mohon tambahkan detail aktivitas dan skill yang digunakan.' : null,
                ]);
            }
        }
    }
}
