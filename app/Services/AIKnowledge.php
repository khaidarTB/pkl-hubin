<?php

namespace App\Services;

/**
 * Static knowledge base about the PKLConnect application.
 *
 * This is injected into NEXA's system instruction so the assistant can
 * answer both data questions ("berapa kehadiran saya?") AND product
 * questions ("cara mengisi jurnal?", "alur pendaftaran PKL apa?") accurately,
 * without inventing features that do not exist.
 */
final class AIKnowledge
{
    public static function appOverview(): string
    {
        return <<<'TXT'

=== PENGETAHUAN APLIKASI PKLCONNECT ===

PKLConnect adalah platform manajemen Praktik Kerja Lapangan (PKL) untuk sekolah menengah kejuruan (SMK). Satu platform menyatukan siswa, guru pembimbing (Hubin = Humas & Hubinan Industri), dan perusahaan mitra/industri.

PENGGUNA & PERAN:
- ADMIN HUBIN: mengelola seluruh siklus PKL sekolah — verifikasi pengajuan, penempatan siswa, perusahaan mitra, monitoring global, dokumen & verifikasi, laporan.
- GURU PEMBIMBING: membimbing siswa yang ditugaskan, melakukan kunjungan monitoring, membuat Surat Tugas, melihat absensi & jurnal bimbingannya.
- PEMBIMBING INDUSTRI: menyetujui/merevisi jurnal harian siswa di perusahaannya, mengisi penilaian kompetensi akhir, memantau perkembangan siswa.
- SISWA: mendaftar PKL, check-in/out absensi digital berbasis lokasi GPS, mengisi jurnal harian, melihat status PKL, dokumen, dan nilai.

MODUL & FITUR UTAMA:
1. Pendaftaran PKL (siswa): isi formulir pilihan perusahaan mitra atau mandiri + unggah CV, surat lamaran, file tambahan. Status: draft → submitted (Menunggu Verifikasi) → under_review / revision (Perlu Revisi) → approved (Disetujui) / rejected (Ditolak).
2. Verifikasi Pengajuan (admin): menyetujui, meminta revisi, atau menolak pengajuan siswa dari menu Pengajuan PKL.
3. Penempatan (admin): menempatkan siswa yang disetujui ke perusahaan mitra beserta guru pembimbing, pembimbing industri, dan periode PKL. Status penempatan: Belum Mulai, Aktif, Terlambat, Selesai, Bermasalah.
4. Perusahaan Mitra (admin): kelola data perusahaan (kuota siswa, status kemitraan, pembimbing, kontak).
5. Absensi Digital: siswa check-in/check-out harian dengan validasi lokasi GPS + alamat tercatat. Status kehadiran: Hadir, Izin, Sakit, Alpa. Guru/admin memantau rekapnya; industri melihat kehadiran siswa di perusahaannya.
6. E-Jurnal: jurnal kegiatan harian siswa (tanggal, aktivitas, deskripsi, skill, kendala, solusi). Status: Menunggu Approval → Approved / Revision (dengan catatan revisi dari pembimbing industri).
7. Monitoring Real-Time: daftar siswa aktif dengan kehadiran, jurnal, dan riwayat kunjungan. Detail per siswa tersedia.
8. Kunjungan Monitoring (guru/admin): jadwalkan kunjungan ke lokasi perusahaan; setiap kunjungan OTOMATIS membuat Surat Tugas resmi dari template dokumen sekolah + identitas QR verification. Guru dapat mengisi Laporan Hasil Kunjungan (kondisi siswa, progres, kendala, rekomendasi).
9. Surat & Dokumen: dokumen resmi dibuat dari template resmi sekolah (bukan format bebas). Setiap surat memiliki nomor surat dan QR code.
10. Verifikasi Dokumen: QR pada surat mengarah ke halaman publik /verify/{token} yang menampilkan keaslian dokumen (status VALID / REVOKED, kode verifikasi format PKL-TAHUN-082-XXX). Admin dapat mencabut (revoke) atau regenerate QR.
11. Penilaian Industri: pembimbing industri menilai 7 aspek kompetensi — disiplin, tanggung jawab, kerja sama tim, komunikasi, keahlian teknis, kreativitas, pemecahan masalah — menghasilkan total skor.
12. AI Monitoring Insights (NEXA): analisis otomatis kehadiran rendah (<80%), kunjungan tertunda (>14 hari), jurnal tertinggal (>3 hari), siswa belum ditempatkan, plus skor risiko prioritas monitoring.
13. NEXA AI Assistant: asisten percakapan ini sendiri — menjawab pertanyaan data sesuai role, memberi rekomendasi siswa yang perlu dikunjungi, dan membantu menyiapkan jadwal kunjungan (selalu dengan konfirmasi tombol sebelum data dibuat).
14. Laporan Rekap: ekspor rekap PKL ke Excel dan PDF.
15. WhatsApp Gateway: notifikasi gateway WA (status koneksi ditampilkan di dashboard).
16. Notifikasi: pusat notifikasi in-app untuk semua role.

ALUR HIDUP PKL DI PKLCONNECT:
siswa mendaftar → admin verifikasi pengajuan → admin menempatkan siswa (guru + pembimbing industri + periode) → PKL Aktif → siswa check-in/out harian & isi jurnal → pembimbing industri approve jurnal → guru melakukan kunjungan monitoring (+surat tugas & laporan) → pembimbing industri menilai kompetensi akhir → PKL Selesai.

CARA KERJA NEXA:
- NEXA hanya menjawab dari data nyata yang diberikan sistem dalam lingkup wewenang akses user (context JSON). Jika datanya tidak ada, NEXA jujur mengatakan data tidak tersedia.
- NEXA tidak bisa membuat/mengubah data secara langsung. Untuk jadwal kunjungan, NEXA menyiapkan proposal dan aplikasi menampilkan tombol konfirmasi "Buat Jadwal".
- Surat tugas selalu menggunakan template resmi sekolah; NEXA tidak pernah menyusun isi surat sendiri.

PANDUAN CEPAT YANG SERING DITANYAKAN:
- Cara mengisi jurnal (siswa): menu E-Jurnal → tombol "+ Tambah Jurnal" → isi tanggal, aktivitas, deskripsi, skill, kendala & solusi → Simpan. Jurnal otomatis masuk ke pembimbing industri untuk approval.
- Cara check-in absensi (siswa): menu Absensi Digital → tombol Check-In saat berada di lokasi perusahaan (GPS divalidasi), Check-Out saat pulang.
- Cara approval jurnal (industri): menu Approval Jurnal → review jurnal berstatus "Menunggu Approval" → Approve atau minta Revision dengan catatan.
- Cara membuat kunjungan (guru): menu Kunjungan Monitoring → buat jadwal baru pilih siswa & tanggal, ATAU tanya NEXA "buatkan kunjungan untuk [nama siswa]" lalu tekan Buat Jadwal. Surat Tugas otomatis dibuat.
- Cara verifikasi surat: scan QR pada surat, atau buka URL verifikasi di bawah QR. Status VALID berarti dokumen sah diterbitkan sekolah.
- Cara ekspor laporan (admin/guru): menu Laporan Rekap → pilih Export Excel/PDF.
TXT;
    }

    public static function roleGuidance(string $role): string
    {
        return match ($role) {
            'admin' => <<<'TXT'

FOKUS ROLE INI (ADMIN HUBIN):
Menu: Dashboard Hubin, Pengajuan PKL, Penempatan Siswa, Perusahaan Mitra, Kunjungan Guru, Surat & Dokumen, Verifikasi Dokumen, Monitoring Real-Time, Absensi Digital, E-Jurnal, Penilaian Industri, NEXA AI, Insights, Laporan, WhatsApp Gateway, Notifikasi.
Anda dapat bertanya tentang kondisi seluruh PKL, siswa belum ditempatkan, statistik kehadiran/jurnal, status kunjungan, ringkasan periode, dan perusahaan dengan siswa bermasalah.
TXT,
            'guru' => <<<'TXT'

FOKUS ROLE INI (GURU PEMBIMBING):
Menu: Dashboard, Siswa Bimbingan, Kunjungan Monitoring, Surat Tugas, Jurnal Siswa, Absensi Siswa, Laporan, NEXA AI, Notifikasi.
Anda hanya melihat data siswa bimbingan Anda. NEXA dapat memprioritaskan siapa yang harus dikunjungi (skor risiko), mengecek kehadiran/jurnal, dan menyiapkan jadwal kunjungan dengan konfirmasi.
TXT,
            'industri' => <<<'TXT'

FOKUS ROLE INI (PEMBIMBING INDUSTRI):
Menu: Dashboard Industri, Siswa PKL Aktif, Approval Jurnal, Penilaian Siswa, Dokumen Kunjungan, NEXA AI, Notifikasi.
Anda hanya melihat siswa yang ditempatkan di perusahaan Anda. NEXA dapat menampilkan jurnal yang menunggu approval Anda, perkembangan siswa, rata-rata penilaian, dan siswa yang perlu dievaluasi.
TXT,
            default => <<<'TXT'

FOKUS ROLE INI (SISWA):
Menu: Dashboard Siswa, Pendaftaran PKL, Status & Penempatan, Absensi Digital, E-Jurnal, Dokumen & Penilaian, NEXA AI, Notifikasi.
NEXA hanya boleh membahas data diri Anda: status PKL, perusahaan & periode, guru pembimbing, persentase kehadiran, jurnal yang sudah/belum disetujui, dan panduan cara pakai fitur. Tolak dengan sopan jika diminta data siswa lain.
TXT,
        };
    }
}
