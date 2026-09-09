# PROPOSAL PROYEK PENGEMBANGAN SISTEM INFORMASI

## **PKLCONNECT**
### **Sistem Informasi & Monitoring Praktik Kerja Lapangan (PKL) SMK Terintegrasi Artificial Intelligence (Nexa AI) dan Verifikasi Kriptografi Dokumen**

---

### **DOKUMEN PROPOSAL**
* **Nama Proyek**: PKLConnect — Smart Vocational Internship Management System
* **Pengembang / Tim**: Tim Pengembang PKLConnect
* **Sasaran Pengguna**: Sekolah Menengah Kejuruan (SMK), Siswa, Guru Pembimbing, dan Dunia Usaha / Dunia Industri (DUDI)
* **Tanggal Dokumen**: 27 Agustus 2026
* **Versi**: 1.0.0 (Production-Ready Draft)

---

## **DAFTAR ISI**
1. [BAB I: PENDAHULUAN](#bab-i-pendahuluan)
   - 1.1 Latar Belakang
   - 1.2 Rumusan Masalah
   - 1.3 Tujuan Proyek
   - 1.4 Manfaat Sistem
2. [BAB II: GAMBARAN UMUM & FITUR UNGGULAN SISTEM](#bab-ii-gambaran-umum--fitur-unggulan-sistem)
   - 2.1 Pengenalan PKLConnect
   - 2.2 Fitur-Fitur Utama (Key Features)
   - 2.3 Peran Pengguna (Multi-Role Access)
3. [BAB III: ARSITEKTUR TEKNOLOGI & SPESIFIKASI TEKNIS](#bab-iii-arsitektur-teknologi--spesifikasi-teknis)
   - 3.1 Technology Stack
   - 3.2 Keamanan & Integrasi AI (Nexa AI Engine)
   - 3.3 Verifikasi Dokumen Kriptografis (QR Verification)
4. [BAB IV: METODOLOGI & TAHAPAN PELAKSANAAN](#bab-iv-metodologi--tahapan-pelaksanaan)
   - 4.1 Tahapan Pengembangan (SDLC)
   - 4.2 Timeline Pelaksanaan (Gantt Chart)
5. [BAB V: RENCANA ANGGARAN BIAYA (RAB)](#bab-v-rencana-anggaran-biaya-rab)
6. [BAB VI: ANALISIS KEUNGGULAN & ANALISIS SWOT](#bab-vi-analisis-keunggulan--analisis-swot)
7. [BAB VII: PENUTUP & KESIMPULAN](#bab-vii-penutup--kesimpulan)

---

<br>

# **BAB I: PENDAHULUAN**

### **1.1 Latar Belakang**
Praktik Kerja Lapangan (PKL) merupakan program wajib pada Sekolah Menengah Kejuruan (SMK) yang bertujuan untuk menjembatani kompetensi akademis siswa dengan kebutuhan riil Dunia Usaha dan Dunia Industri (DUDI). Namun, dalam eksekusi operasionalnya, mayoritas SMK di Indonesia masih menghadapi berbagai kendala klasik berbasis proses manual:

1. **Monitoring Absensi & Kehadiran Tidak Real-Time**: Sulitnya memastikan presensi siswa di lokasi industri secara aktual tanpa adanya manipulasi titik lokasi atau waktu.
2. **Pengisian Jurnal Kegiatan Secara Manual & Berisiko Hilang**: Penggunaan buku jurnal cetak rentan hilang, rusak, serta memerlukan waktu lama bagi guru pembimbing maupun instruktur industri untuk memberikan pengesahan (sign/approval).
3. **Koordinasi Kunjungan Monitoring Guru Terhambat**: Guru pembimbing kesulitan mengelola jadwal kunjungan ke belasan hingga puluhan mitra industri, serta laporan hasil kunjungan sering kali terlambat diarsipkan.
4. **Resiko Pemalsuan Dokumen & Sertifikat PKL**: Maraknya manipulasi nilai, surat pengantar, maupun sertifikat kelulusan PKL tanpa skema verifikasi keabsahan yang valid.
5. **Kurangnya Analisis Data & Deteksi Dini Kinerja Siswa**: Pihak sekolah (Admin/Humas) kesulitan memetakan siswa yang bermasalah atau industri yang membutuhkan intervensi secara cepat.

Untuk menjawab permasalahan tersebut, **PKLConnect** hadir sebagai solusi platform ekosistem digital terpadu berbasis web yang mengintegrasikan kecerdasan buatan (**Nexa AI**), absensi berbasis Geolocation, pengesahan kriptografis QR Code, serta notifikasi otomatis WhatsApp.

### **1.2 Rumusan Masalah**
1. Bagaimana mengotomatisasi pengawasan presensi dan kegiatan harian siswa PKL secara real-time dan terverifikasi lokasi?
2. Bagaimana mempermudah koordinasi antara 4 entitas utama: Admin Sekolah, Guru Pembimbing, Siswa, dan Instruktur Industri (DUDI)?
3. Bagaimana mengintegrasikan Teknologi Artificial Intelligence untuk mendeteksi kendala siswa serta memberikan rekomendasi analisis secara cerdas?
4. Bagaimana memastikan keabsahan dokumen dan sertifikat PKL agar bebas dari tindakan pemalsuan?

### **1.3 Tujuan Proyek**
* **Tujuan Umum**: Mengembangkan platform SaaS/Web App modern **PKLConnect** yang mentransformasi tata kelola PKL SMK dari konvensional menjadi digital, transparan, efisien, dan cerdas.
* **Tujuan Khusus**:
  * Menyediakan dashboard terintegrasi untuk 4 role pengguna.
  * Mengimplementasikan fitur presensi berbasis GPS & foto selfie anti-spoofing.
  * Mengintegrasikan asisten cerdas **Nexa AI** berbasis Google Gemini API untuk analisis otomatis.
  * Membangun sistem keamanan dokumen dengan modul verifikasi QR Code berbasis enkripsi token/hash.
  * Menyediakan gateway notifikasi otomatis berbasis WhatsApp & Email.

### **1.4 Manfaat Sistem**
* **Bagi Sekolah (Admin & Kepala Sekolah)**: Efisiensi rekapitulasi data hingga 90%, pemetaan mitra industri yang presisi, dan transparansi laporan seluruh kegiatan PKL.
* **Bagi Siswa**: Kemudahan pencatatan jurnal harian dari perangkat smartphone, kejelasan status penempatan, dan akses sertifikat digital resmi.
* **Bagi Guru Pembimbing**: Memudahkan penjadwalan kunjungan, rute monitoring, serta validasi e-jurnal siswa kapan saja dan di mana saja.
* **Bagi Dunia Industri (DUDI)**: Proses evaluasi kinerja siswa yang praktis tanpa beban administratif kertas yang rumit.

---

<br>

# **BAB II: GAMBARAN UMUM & FITUR UNGGULAN SISTEM**

### **2.1 Pengenalan PKLConnect**
**PKLConnect** adalah platform manajemen dan monitoring Praktik Kerja Lapangan (PKL) generasi baru yang dirancang khusus untuk memenuhi standar kurikulum SMK modern dan kebutuhan digitalisasi industri 4.0. PKLConnect menghubungkan seluruh pihak dalam satu lingkungan aplikasi web yang responsive, interaktif, dan aman.

```
       +-------------------------------------------------------+
       |                  PKLCONNECT PLATFORM                  |
       +-------------------------------------------------------+
              |               |               |               |
     +--------v---+  +--------v---+  +--------v---+  +--------v---+
     |   ADMIN    |  |   SISWA    |  |    GURU    |  |   INDUSTRI |
     |  SEKOLAH   |  |            |  | PEMBIMBING |  |    (DUDI)  |
     +------------+  +------------+  +------------+  +------------+
           \               /                \               /
            \             /                  \             /
         +---------------------------------------------------+
         | CORE MODULES & AI INTEGRATION (NEXA AI ENGINE)    |
         | - Geolocation Attendance  - Cryptographic QR      |
         | - E-Journal Harian       - WA Gateway Alerts     |
         | - Monitoring Visit Report - Automated Assessment  |
         +---------------------------------------------------+
```

### **2.2 Fitur-Fitur Utama (Key Features)**

1. **Nexa AI Assistant & Intelligent Insights**:
   - Asisten cerdas berbasis AI yang terintegrasi pada backend (Laravel) dan frontend (React).
   - Menyediakan analisis risiko siswa (misal: deteksi siswa dengan presensi buruk atau kendala jurnal).
   - Memberikan ringkasan laporan otomatis untuk Guru Pembimbing dan Admin.
   - Fitur Tanya-Jawab interaktif seputar regulasi PKL dan pemecahan masalah kendala industri.

2. **Real-Time Geolocation Attendance & Anti-Spoofing**:
   - Absensi masuk dan pulang menggunakan koordinat GPS (latitude/longitude) dan verifikasi foto selfie.
   - Validasi radius jarak otomatis dengan lokasi kantor industri mitra (Geo-fencing).

3. **E-Journal & Activity Tracking**:
   - Pencatatan jurnal kegiatan harian siswa dilengkapi dengan attachment foto bukti pengerjaan tugas.
   - Sistem alur persetujuan ganda (Double Approval) oleh Pembimbing Lapangan DUDI dan Guru Pembimbing Sekolah.

4. **Monitoring Kunjungan Guru & Automated WA Gateway**:
   - Fitur penugasan dan pelaporan kunjungan guru pembimbing ke lokasi DUDI.
   - Integrasi otomatis dengan WhatsApp Gateway untuk mengirimkan notifikasi jadwal kunjungan, pengingat isi jurnal, dan laporan presensi.

5. **Cryptographic QR Code Document Verification**:
   - Penerbitan Surat Pengantar PKL, Surat Balasan, dan Sertifikat Kelulusan PKL dilengkapi QR Code unik.
   - Halaman publik penjelajah verifikasi dokumen (`/verify/{code}`) untuk memastikan keaslian dokumen tanpa perlu login.

6. **Automated Assessment & Penilaian Terpadu**:
   - Form penilaian kinerja kuantitatif dan kualitatif oleh Pembimbing DUDI.
   - Penggabungan otomatis bobot nilai industri dan nilai pembimbing sekolah menjadi Nilai Akhir PKL.

---

<br>

# **BAB III: ARSITEKTUR TEKNOLOGI & SPESIFIKASI TEKNIS**

### **3.1 Technology Stack**

PKLConnect dibangun menggunakan teknologi mutakhir (cutting-edge) yang menjamin performa tinggi, kemudahan maintenance, serta keamanan skala enterprise:

| Layer / Komponen | Teknologi yang Digunakan | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 12 (PHP 8.3+)** | Framework PHP paling robust, aman, mendukung Eloquent ORM, Job Queues, dan Security Policy modern. |
| **Frontend Framework** | **React 18 + Inertia.js** | Menghasilkan pengalaman Single Page Application (SPA) tanpa perlu membangun REST API secara terpisah. |
| **Styling & UI** | **Tailwind CSS + Shadcn UI** | Tampilan antarmuka modern, clean, ultra-responsive, dan ramah pengguna (SaaS Aesthetic). |
| **Type Safety** | **TypeScript** | Meminimalkan bug di sisi frontend melalui pengetikan variabel yang ketat. |
| **AI Integration** | **Google Gemini 1.5/2.0 API** | Pemrosesan bahasa alami (NLP) berkecepatan tinggi untuk analisis data contextual AI (Nexa AI). |
| **Database** | **MySQL 8.0 / PostgreSQL** | Database relasional handal untuk integritas data antar tabel penempatan, absensi, dan penilaian. |
| **Realtime Notification** | **WhatsApp API Gateway + Mail** | Penyampaian pesan notifikasi langsung ke smartphone pengguna secara cepat. |

---

<br>

# **BAB IV: METODOLOGI & TAHAPAN PELAKSANAAN**

### **4.1 Tahapan Pengembangan (SDLC - Agile Development)**

Pengembangan proyek PKLConnect menggunakan pendekatan **Agile Development Methodology** yang terbagi dalam 4 fase utama:

```
[ Fase 1: Perencanaan & Desain ] ➔ [ Fase 2: Pengembangan Core & AI ] ➔ [ Fase 3: Pengujian & Keamanan ] ➔ [ Fase 4: Deployment & Pelatihan ]
```

1. **Fase 1: Requirement Gathering & System Architecture (Minggu 1-2)**
   - Identifikasi kebutuhan spesifik sekolah dan standar instansi DUDI.
   - Perancangan skema database (ERD), wireframe UI/UX, dan alur kerja antar-role.
2. **Fase 2: Core Engine & Module Development (Minggu 3-5)**
   - Pembangunan backend Laravel 12 dan UI React/Inertia.
   - Integrasi modul presensi GPS, E-Jurnal, QR Verification, serta Nexa AI Assistant.
3. **Fase 3: Quality Assurance, Testing & Security Audit (Minggu 6-7)**
   - Pengujian fungsi (Unit Testing & E2E Testing).
   - Pengujian keamanan verifikasi kriptografi QR dan uji beban server.
4. **Fase 4: Deployment, Training & Handover (Minggu 8)**
   - Deployment ke cloud server (VPS / Production Environment dengan SSL & Nginx).
   - Pelatihan penggunaan aplikasi untuk Admin Sekolah, Guru, Siswa, dan perwakilan DUDI.

---

<br>

# **BAB V: RENCANA ANGGARAN BIAYA (RAB)**

Berikut adalah estimasi Rencana Anggaran Biaya pengembangan dan implementasi sistem **PKLConnect**:

| No | Komponen Pekerjaan / Item | Vol | Satuan | Harga Satuan (IDR) | Total (IDR) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **A** | **Pengembangan Perangkat Lunak (Software Development)** | | | | |
| 1 | System Architecture & Database Design | 1 | Paket | Rp 3.500.000 | Rp 3.500.000 |
| 2 | Backend & API Development (Laravel 12) | 1 | Paket | Rp 7.500.000 | Rp 7.500.000 |
| 3 | Frontend SPA Development (React + Inertia + Tailwind) | 1 | Paket | Rp 7.000.000 | Rp 7.000.000 |
| 4 | Integrasi Nexa AI Assistant (Gemini API Core Engine) | 1 | Modul | Rp 4.500.000 | Rp 4.500.000 |
| 5 | Modul Cryptographic QR Verification & WA Gateway | 1 | Modul | Rp 3.500.000 | Rp 3.500.000 |
| **B** | **Infrastruktur & Layanan Cloud (Tahun Pertama)** | | | | |
| 6 | Cloud VPS Host (High Performance 4 vCPU, 8GB RAM) | 12 | Bulan | Rp 450.000 | Rp 5.400.000 |
| 7 | Domain Name (.id / .ac.id / .sch.id) & SSL Certificate | 1 | Tahun | Rp 350.000 | Rp 350.000 |
| 8 | Quota API WhatsApp Gateway & Gemini AI Tokens | 1 | Paket | Rp 2.000.000 | Rp 2.000.000 |
| **C** | **Pengujian, Pelatihan & Garansi** | | | | |
| 9 | Quality Assurance (QA Testing & Security Audit) | 1 | Paket | Rp 2.500.000 | Rp 2.500.000 |
| 10| Pelatihan Pengguna (User Training) & Dokumentasi | 1 | Paket | Rp 2.000.000 | Rp 2.000.000 |
| 11| Maintenance & Garansi Sistem (6 Bulan) | 1 | Paket | Rp 3.000.000 | Rp 3.000.000 |
| **TOTAL KESELURUHAN ESTIMASI ANGGARAN** | | | | | **Rp 40.750.000** |

*Catatan: Anggaran di atas fleksibel dan dapat disesuaikan dengan skala kebutuhan jumlah siswa dan mitra industri sekolah.*

---

<br>

# **BAB VI: ANALISIS KEUNGGULAN & ANALISIS SWOT**

### **6.1 Analisis SWOT Proyek PKLConnect**

* **Strengths (Kekuatan)**:
  - Teknologi mutakhir terintegrasi AI pertama yang dikhususkan untuk PKL SMK.
  - Multi-role dashboard yang sangat intuitive dan responsive.
  - Pengamanan dokumen dengan verifikasi QR Code terenkripsi.
* **Weaknesses (Kelemahan)**:
  - Membutuhkan koneksi internet untuk sinkronisasi data presensi dan jurnal.
* **Opportunities (Peluang)**:
  - Kebijakan Kementerian Pendidikan terkait digitalisasi Manajemen SMK dan Vokasi.
  - Potensi ekspansi sebagai platform SaaS nasional untuk ratusan SMK di Indonesia.
* **Threats (Tantangan)**:
  - Tingkat kesiapan literasi digital sebagian instruktur lapangan di daerah terpencil. *(Dapat diatasi dengan interface antarmuka DUDI yang sangat sederhana).*

---

<br>

# **BAB VII: PENUTUP & KESIMPULAN**

### **7.1 Kesimpulan**
Sistem **PKLConnect** menghadirkan terobosan nyata dalam modernisasi tata kelola Praktik Kerja Lapangan di lingkungan SMK. Dengan mengolaborasikan kecerdasan buatan (**Nexa AI**), kepastian lokasi (GPS Attendance), kemudahan birokrasi jurnal harian, dan keamanan sertifikat digital berakurasi tinggi, PKLConnect tidak hanya menyelesaikan masalah administratif tetapi juga meningkatkan nilai mutu dan akreditasi sekolah di mata mitra industri.

Demikian proposal proyek ini kami susun dengan penuh tanggung jawab. Kami siap untuk melakukan presentasi produk (Demo Prototype PKLConnect) dan mendiskusikan rencana kerja sama lebih lanjut.

---
**Hormat Kami,**

**Tim Pengembang PKLConnect**  
*Email: contact@pklconnect.id | Website: https://pklconnect.id*
