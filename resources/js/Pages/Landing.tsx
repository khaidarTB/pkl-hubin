import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { GuestLayout } from '@/Layouts/GuestLayout';
import { 
    Sparkles, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    CalendarCheck, 
    BookOpen, 
    GraduationCap, 
    LineChart, 
    MessageSquare, 
    FileText, 
    AlertTriangle,
    Users,
    Building2,
    Zap,
    MapPin,
    QrCode,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Award,
    Briefcase,
    Globe,
    Cpu,
    Wrench,
    Check
} from 'lucide-react';

interface Props {
    stats: {
        total_students: number;
        active_students: number;
        industries: number;
        digital_percentage: string;
        admin_reduction: string;
    };
    partnerships?: Array<{ id: number; name: string; industry_type: string }>;
    documentations?: Array<{ id: number; title: string; photo_path: string; category: string }>;
}

export default function Landing({ stats, partnerships = [], documentations = [] }: Props) {

    const gallerySlides = [
        {
            id: 1,
            title: "Penandatanganan MoU Sinergi Vokasi & Industri 2026",
            subtitle: "SMK Taruna Bangsa bekerjasama resmi dengan PT Astra International & PT Telkom Indonesia",
            category: "MoU & Kemitraan DUDI",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80",
            badge: "Kerja Sama Resmi DUDI"
        },
        {
            id: 2,
            title: "Pelepasan & Pembekalan Siswa PKL Taruna Bangsa",
            subtitle: "Pengarahan etika kerja, keselamatan K3, dan penggunaan sistem presensi GPS PKLConnect",
            category: "Pembekalan Siswa",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
            badge: "500+ Siswa Ditempatkan"
        },
        {
            id: 3,
            title: "Kunjungan Monitoring Guru Pembimbing Ke Perusahaan Mitra",
            subtitle: "Evaluasi berkala kompetensi teknis dan koordinasi dengan Mentor Pembimbing Industri",
            category: "Monitoring Lapangan",
            image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=80",
            badge: "Verifikasi Geolocation"
        },
        {
            id: 4,
            title: "Praktik Industri Lab RPL & Digital Innovation Center",
            subtitle: "Siswa jurusan Rekayasa Perangkat Lunak mengerjakan project real-world di PT Digital Nusantara",
            category: "Praktik Industri",
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80",
            badge: "Standar Industri Tier-1"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length);

    // 2. Partner Logos (SMK Taruna Bangsa Industry Partners)
    const partnerLogos = [
        { name: 'PT Astra International Tbk', category: 'Otomotif & Manufaktur', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Logo_of_PT_Astra_International_Tbk_terbaru_2025.png?utm_source=id.wikipedia.org&utm_campaign=index&utm_content=original' },
        { name: 'PT Toyota-Astra Motor', category: 'Manufaktur Presisi', logo: 'https://recruitment.toyota.astra.co.id/img/tam-logo.png' },
        { name: 'Bank Indonesia', category: 'IT & Financial Technology', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/BI_Logo_%28cropped%29.png/250px-BI_Logo_%28cropped%29.png?utm_source=commons.wikimedia.org&utm_campaign=parser&utm_content=thumbnail' },
        { name: 'PT Digital Nusantara Solusindo', category: 'Data Center', logo: 'https://dci-indonesia.com/images/logo/logo-white.svg' },
        { name: 'PT Teradata Indonusa, Tbk.', category: 'Hardware & Tech Manufracture', logo: 'https://e-ipo.co.id/en/pipeline/get-logo?id=97'},
        { name: 'Badan Pusat Statistik', category: 'Population Registration', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Lambang_Badan_Pusat_Statistik_%28BPS%29_Indonesia.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original'},
        { name: 'Axioo Class Program', category: 'Class Program', logo: 'https://smkn1geger.sch.id/wp-content/uploads/2017/09/kelas-industri-axioo.png'},
    ];

    // 3. Lifecycle Steps
    const lifecycleSteps = [
        { title: '1. Pendaftaran PKL', desc: 'Siswa memilih perusahaan mitra terverifikasi Hubin SMK Taruna Bangsa atau mengajukan proposal mandiri.', icon: FileText },
        { title: '2. Approval Hubin', desc: 'Verifikasi kesesuaian jurusan (RPL, TKJ, DKV, TKR), kelayakan CV, dan alokasi kuota industri.', icon: CheckSquare },
        { title: '3. Penempatan Industri', desc: 'Penetapan resmi Surat Penempatan, penunjukan Guru Pembimbing Sekolah & Supervisor Industri.', icon: MapPin },
        { title: '4. Monitoring & GPS', desc: 'Absensi harian radius GPS, pengisian E-Jurnal kegiatan, dan visit monitoring berkala guru.', icon: CalendarCheck },
        { title: '5. QR Verifikasi Surat', desc: 'Setiap surat tugas memiliki Verification ID & QR Code yang dapat dipindai untuk validasi keaslian dokumen.', icon: QrCode },
        { title: '6. Evaluasi 7 Aspek', desc: 'Penilaian standar industri 7 indikator vokasi & rekapitulasi sertifikat nilai PKL terpusat.', icon: GraduationCap },
    ];

    // 4. Majors at SMK Taruna Bangsa
    const majors = [
        { name: 'Rekayasa Perangkat Lunak (RPL)', icon: Cpu, desc: 'Web & Mobile Dev, Databases, RESTful API, & Software Quality Assurance.' },
        { name: 'Teknik Komputer & Jaringan (TKJ)', icon: Globe, desc: 'Network Infrastructure, Cloud Computing, Cybersecurity, & Server Admin.' },
        { name: 'Desain Komunikasi Visual (DKV)', icon: Sparkles, desc: 'UI/UX Design, Motion Graphics, Branding Identity, & Digital Media.' },
        { name: 'Teknik Kendaraan Ringan (TKR)', icon: Wrench, desc: 'Engine Diagnostic, Automotive System, Electronic Control Unit (ECU).' },
    ];

    return (
        <GuestLayout>
            <Head title="Hubin SMK Taruna Bangsa — PKLConnect Emerald Edition" />

            {/* HERO SECTION WITH PHOTO SLIDER */}
            <section className="relative overflow-hidden pt-8 pb-20 bg-slate-950 text-white">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-emerald-600/20 via-teal-600/15 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold mb-6">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span>HUBIN SMK TARUNA BANGSA</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                            Hubungkan Siswa, Sekolah, dan Industri  <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
                                dalam Satu Platform
                            </span>
                        </h1>

                        <p className="mt-4 text-slate-300 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto">
                            Menghubungkan <strong className="text-emerald-300">Siswa SMK Taruna Bangsa</strong>, <strong className="text-emerald-300">Guru Pembimbing</strong>, dan <strong className="text-emerald-300">50+ Perusahaan Mitra Nasional</strong> dalam satu ekosistem digital real-time terintegrasi.
                        </p>
                    </div>

                    <div id="galeri" className="relative max-w-6xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                        <div className="relative h-[360px] sm:h-[500px] w-full overflow-hidden">
                            {gallerySlides.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                        idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                                >
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    {/* Overlay Gradient Emerald */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6 sm:p-10">
                                        <span className="inline-block self-start px-3.5 py-1.5 bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider rounded-full mb-3 border border-slate-700">
                                            {slide.badge}
                                        </span>
                                        <h3 className="text-xl sm:text-3xl font-black text-white leading-snug">
                                            {slide.title}
                                        </h3>
                                        <p className="text-xs sm:text-base text-slate-300 mt-1 font-medium max-w-2xl">
                                            {slide.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slider Nav Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-700/60 text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-700/60 text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Slider Indicators Dots */}
                        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-sm">
                            {gallerySlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-slate-500 hover:bg-slate-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons Below Slider */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-slate-800 transition-colors flex items-center justify-center gap-3"
                        >
                            <span>Masuk ke Portal PKL</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="#alur"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm sm:text-base hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>Lihat Alur Siklus PKL</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* INFINITE COMPANY LOGO SLIDER MARQUEE */}
            <section id="mitra" className="py-12 bg-slate-900 border-y border-slate-800 overflow-hidden">
                <div className="w-full px-4 sm:px-8 lg:px-12 text-center mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-2">
                        <Briefcase className="w-4 h-4" /> Mitra DUDI Resmi Hubin SMK Taruna Bangsa
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">Daftar Perusahaan & Industri Tempat PKL Siswa</h2>
                </div>

                <div className="relative w-full overflow-hidden py-4">
                    <div className="flex w-[200%] animate-marquee space-x-6">
                        {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                            <div
                                key={idx}
                                className="w-64 shrink-0 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 font-black text-[10px] shrink-0">
                                    <img src={partner.logo} alt="partners logo" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <h4 className="font-bold text-white text-[11px] truncate">{partner.name}</h4>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{partner.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VOKASI STATS COUNTER */}
            <section className="py-12 bg-white">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-3xl sm:text-4xl font-black text-emerald-600">500+</span>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Siswa PKL Aktif</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-3xl sm:text-4xl font-black text-blue-600">52+</span>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Perusahaan Mitra MoU</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-3xl sm:text-4xl font-black text-emerald-600">100%</span>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Digital TTD & Geolocation</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-3xl sm:text-4xl font-black text-emerald-600">4.9/5</span>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Kepuasan Industri</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROGRAM KEAHLIAN SHOWCASE */}
            <section id="program" className="py-16 bg-slate-50">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Kompetensi Vokasi</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Program Keahlian SMK Taruna Bangsa</h2>
                        <p className="mt-2 text-slate-600 text-sm">Siswa siap ditempatkan PKL sesuai standar keahlian spesifik industri modern.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {majors.map((m, idx) => {
                            const Icon = m.icon;
                            return (
                                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-[14px] mb-2">{m.name}</h3>
                                    <p className="text-[12px] text-slate-600 leading-relaxed">{m.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* END-TO-END LIFECYCLE ROADMAP */}
            <section id="alur" className="py-20 bg-white">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Sistem Terintegrasi PKLConnect</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Alur Pengelolaan PKL SMK Taruna Bangsa</h2>
                        <p className="mt-3 text-slate-600 text-sm">Proses efisien dari pendaftaran hingga diterbitkannya nilai akhir sertifikat PKL.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lifecycleSteps.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-[12px] text-slate-600 leading-relaxed">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* DIRECT DEMO LOGIN ACCOUNTS */}
            <section className="py-16 bg-slate-950 text-white border-t border-slate-800">
                <div className="w-full px-4 sm:px-8 lg:px-12 text-center">
                    <div className="max-w-3xl mx-auto mb-10">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            Uji Coba Langsung
                        </span>
                        <h2 className="text-3xl font-black text-white mt-3">Akses Demo Login 4 Peran Pengguna</h2>
                        <p className="text-slate-400 text-sm mt-2">Coba interaksi lengkap sebagai Admin Hubin, Guru Pembimbing, Industri, atau Siswa.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
                        {[
                            { role: 'Admin Hubin', desc: 'Verifikasi pengajuan, penempatan siswa, & Early Warning System.', email: 'admin@pklconnect.id', icon: '👑', color: 'emerald' },
                            { role: 'Guru Pembimbing', desc: 'Jadwal kunjungan monitoring, laporan visit, & TTD Surat Tugas.', email: 'guru@pklconnect.id', icon: '👨‍🏫', color: 'blue' },
                            { role: 'Pembimbing Industri', desc: 'Approval E-Jurnal harian & pengisian nilai 7 aspek standar vokasi.', email: 'industri@pklconnect.id', icon: '🏢', color: 'emerald' },
                            { role: 'Siswa PKL', desc: 'Pendaftaran PKL, Presensi GPS Geolocation, & pengisian E-Jurnal.', email: 'siswa@pklconnect.id', icon: '🎓', color: 'emerald' },
                        ].map((item) => (
                            <div key={item.role} className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-2xl space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-xl flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-white text-[14px]">{item.role}</h4>
                                <p className="text-[12px] text-slate-400">{item.desc}</p>
                                <p className="text-[11px] font-mono text-emerald-400">{item.email}</p>
                                <Link href="/login" className="block text-center w-full py-2 bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[12px] rounded-xl hover:bg-slate-700 transition-colors">
                                    Login {item.role.split(' ')[0]} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-20 bg-slate-950 text-white text-center border-t border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Mulai Pengelolaan PKL Vokasi Berstandar Industri</h2>
                    <p className="mt-4 text-slate-400 text-sm sm:text-lg">
                        Tingkatkan efisiensi kerja sama Hubungan Industri SMK Taruna Bangsa dengan PKLConnect.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:bg-slate-100 transition-colors"
                        >
                            <span>Masuk ke Dashboard</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
