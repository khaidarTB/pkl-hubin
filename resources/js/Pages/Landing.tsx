import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { GuestLayout } from '@/Layouts/GuestLayout';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CalendarCheck,
    CheckSquare,
    Cpu,
    FileText,
    Globe,
    Pause,
    Play,
    QrCode,
    Sparkles,
    Wrench,
} from 'lucide-react';

interface Props {
    companies?: Array<{
        id: number;
        name: string;
        industry_type?: string | null;
    }>;
}

const gallerySlides = [
    {
        title: 'Pengajuan dan penempatan',
        description: 'Siswa mengajukan PKL dan melihat proses penempatannya.',
        category: 'Pengajuan',
        image: '/img/gallery/pkl1.webp',
    },
    {
        title: 'Kegiatan di tempat PKL',
        description: 'Siswa mencatat kegiatan selama menjalani praktik kerja.',
        category: 'Kegiatan',
        image: '/img/gallery/pkl2.webp',
    },
    {
        title: 'Pemantauan siswa',
        description: 'Guru pembimbing memantau perkembangan dan kunjungan PKL.',
        category: 'Monitoring',
        image: '/img/gallery/pkl3.webp',
    },
    {
        title: 'Penilaian hasil PKL',
        description: 'Pembimbing industri mengisi penilaian siswa.',
        category: 'Penilaian',
        image: '/img/gallery/pkl4.webp',
    },
];

const majors = [
    {
        name: 'Rekayasa Perangkat Lunak (RPL)',
        description: 'Pengembangan perangkat lunak dan pengelolaan basis data.',
        icon: Cpu,
    },
    {
        name: 'Teknik Komputer dan Jaringan (TKJ)',
        description: 'Komputer, jaringan, dan infrastruktur server.',
        icon: Globe,
    },
    {
        name: 'Desain Komunikasi Visual (DKV)',
        description: 'Komunikasi visual, desain, dan media digital.',
        icon: Sparkles,
    },
    {
        name: 'Teknik Kendaraan Ringan (TKR)',
        description: 'Perawatan dan sistem kendaraan ringan.',
        icon: Wrench,
    },
];

const lifecycleSteps = [
    {
        title: 'Pengajuan',
        description: 'Siswa mengajukan PKL melalui portal.',
        detail: 'Pengajuan ditinjau sebelum siswa ditempatkan.',
        icon: FileText,
    },
    {
        title: 'Verifikasi dan penempatan',
        description: 'Hubin memeriksa pengajuan dan mengatur penempatan.',
        detail: 'Guru pembimbing dan perusahaan menjadi bagian dari proses.',
        icon: CheckSquare,
    },
    {
        title: 'Pelaksanaan dan monitoring',
        description: 'Siswa mengisi jurnal dan melakukan presensi.',
        detail: 'Guru dapat mencatat kunjungan untuk memantau kegiatan PKL.',
        icon: CalendarCheck,
    },
    {
        title: 'Penilaian dan dokumen',
        description: 'Pembimbing industri mengisi penilaian siswa.',
        detail: 'Dokumen yang diterbitkan dapat diperiksa melalui QR.',
        icon: QrCode,
    },
];

const userRoles = [
    {
        name: 'Admin Hubin',
        description: 'Mengelola pengajuan, perusahaan, dan penempatan siswa.',
    },
    {
        name: 'Guru pembimbing',
        description: 'Memantau siswa bimbingan dan mencatat kunjungan.',
    },
    {
        name: 'Pembimbing industri',
        description: 'Memeriksa jurnal dan mengisi penilaian siswa.',
    },
    {
        name: 'Siswa',
        description: 'Mengajukan PKL, melakukan presensi, dan mengisi jurnal.',
    },
];

export default function Landing({ companies = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    }, []);

    useEffect(() => {
        if (isCarouselPaused || prefersReducedMotion) return;

        const timer = window.setInterval(() => {
            setCurrentSlide((slide) => (slide + 1) % gallerySlides.length);
        }, 7000);

        return () => window.clearInterval(timer);
    }, [isCarouselPaused, prefersReducedMotion]);

    const previousSlide = () => {
        setCurrentSlide((slide) => (slide - 1 + gallerySlides.length) % gallerySlides.length);
    };

    const nextSlide = () => {
        setCurrentSlide((slide) => (slide + 1) % gallerySlides.length);
    };

    return (
        <GuestLayout showNexa={false}>
            <Head title="PKLConnect" />

            <section className="bg-white">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-12 lg:py-16">
                    <div className="max-w-xl">
                        <p className="mb-4 text-sm font-semibold text-emerald-700">
                            PKL SMK Taruna Bangsa
                        </p>
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
                            Kelola PKL siswa dari pengajuan hingga penilaian
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                            PKLConnect membantu siswa, guru, Hubin, dan pembimbing industri
                            mengelola proses PKL melalui satu portal.
                        </p>
                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/login"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                            >
                                Masuk ke PKLConnect
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                            <a
                                href="#alur"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                            >
                                Pelajari alur PKL
                                <ArrowDown aria-hidden="true" className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div
                        id="galeri"
                        className="relative isolate aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 text-white"
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Ilustrasi proses PKL"
                    >
                        {gallerySlides.map((slide, index) => (
                            <div
                                key={slide.title}
                                className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
                                    index === currentSlide
                                        ? 'z-10 opacity-100'
                                        : 'z-0 opacity-0'
                                }`}
                                aria-hidden={index !== currentSlide}
                            >
                                <img
                                    src={slide.image}
                                    alt={`Ilustrasi ${slide.title.toLowerCase()} (foto stok)`}
                                    className="h-full w-full object-cover"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5 pb-16 sm:p-8 sm:pb-20">
                                    <p className="mb-2 text-xs font-semibold text-emerald-300">
                                        Ilustrasi · {slide.category}
                                    </p>
                                    <h2 className="text-xl font-semibold sm:text-2xl">
                                        {slide.title}
                                    </h2>
                                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-200">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-white/15 bg-slate-950/40 px-4 py-3 sm:px-6">
                            <p className="text-xs text-slate-200">Foto ilustrasi</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCarouselPaused((paused) => !paused)}
                                    className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-xs font-medium text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    disabled={prefersReducedMotion}
                                    aria-label={
                                        prefersReducedMotion
                                            ? 'Putar otomatis dimatikan sesuai preferensi gerak'
                                            : isCarouselPaused
                                              ? 'Putar otomatis'
                                              : 'Jeda putar otomatis'
                                    }
                                    aria-pressed={isCarouselPaused || prefersReducedMotion}
                                >
                                    {isCarouselPaused ? (
                                        <Play aria-hidden="true" className="h-4 w-4" />
                                    ) : (
                                        <Pause aria-hidden="true" className="h-4 w-4" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {isCarouselPaused ? 'Putar' : 'Jeda'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={previousSlide}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    aria-label="Foto sebelumnya"
                                >
                                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextSlide}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    aria-label="Foto berikutnya"
                                >
                                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="absolute right-4 top-4 z-20 flex gap-1.5"
                            role="group"
                            aria-label="Pilih foto"
                        >
                            {gallerySlides.map((slide, index) => (
                                <button
                                    key={slide.title}
                                    type="button"
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2.5 rounded-full border border-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                                        index === currentSlide
                                            ? 'w-6 bg-white'
                                            : 'w-2.5 bg-slate-900/50'
                                    }`}
                                    aria-label={`Tampilkan foto ${index + 1}: ${slide.title}`}
                                    aria-current={index === currentSlide ? 'true' : undefined}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="mitra" className="scroll-mt-24 border-y border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-12 lg:py-14">
                    <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold text-emerald-700">Perusahaan</p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                Tempat PKL yang terdaftar
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-slate-600">
                            Daftar ini mengikuti data perusahaan berstatus aktif di PKLConnect.
                        </p>
                    </div>

                    {companies.length > 0 ? (
                        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                            {companies.map((company) => (
                                <li
                                    key={company.id}
                                    className="border-t border-slate-300 py-4"
                                >
                                    <h3 className="font-semibold text-slate-900">{company.name}</h3>
                                    {company.industry_type && (
                                        <p className="mt-1 text-sm text-slate-600">
                                            {company.industry_type}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="border-t border-slate-300 py-4 text-sm text-slate-600">
                            Belum ada perusahaan aktif yang dapat ditampilkan.
                        </p>
                    )}
                </div>
            </section>

            <section id="program" className="scroll-mt-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-16">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-emerald-700">Bidang keahlian</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            Program keahlian SMK Taruna Bangsa
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Bidang keahlian yang ditampilkan dalam informasi PKL sekolah.
                        </p>
                    </div>

                    <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                        {majors.map((major) => {
                            const Icon = major.icon;

                            return (
                                <li
                                    key={major.name}
                                    className="border-t-2 border-emerald-700 py-5"
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className="mb-4 h-5 w-5 text-emerald-700"
                                    />
                                    <h3 className="font-semibold leading-6 text-slate-900">
                                        {major.name}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {major.description}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <section id="alur" className="scroll-mt-24 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-16">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-emerald-700">Proses PKL</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            Dari pengajuan sampai penilaian
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Tahapan utama pengelolaan PKL di PKLConnect.
                        </p>
                    </div>

                    <ol className="mt-8 divide-y divide-slate-300 border-y border-slate-300">
                        {lifecycleSteps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <li
                                    key={step.title}
                                    className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr_1.2fr] sm:items-start sm:gap-6"
                                >
                                    <span className="flex items-center gap-3 text-sm font-semibold tabular-nums text-emerald-800 sm:block">
                                        <Icon
                                            aria-hidden="true"
                                            className="h-5 w-5 text-emerald-700 sm:mb-3"
                                        />
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-slate-950">{step.title}</h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-700">
                                            {step.description}
                                        </p>
                                    </div>
                                    <p className="text-sm leading-6 text-slate-600">
                                        {step.detail}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12 lg:py-16">
                    <div className="max-w-md">
                        <p className="text-sm font-semibold text-emerald-700">Akses pengguna</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            Satu portal, akses sesuai peran
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Masuk menggunakan akun yang diberikan sekolah atau perusahaan.
                            Halaman masuk tidak menyediakan akun demo.
                        </p>
                        <Link
                            href="/login"
                            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                        >
                            Login pengguna
                            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>

                    <ul className="divide-y divide-slate-200 border-y border-slate-200">
                        {userRoles.map((role) => (
                            <li
                                key={role.name}
                                className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6"
                            >
                                <h3 className="font-semibold text-slate-900">{role.name}</h3>
                                <p className="text-sm leading-6 text-slate-600">
                                    {role.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="bg-slate-900 text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 lg:py-14">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Kelola proses PKL dalam satu portal.
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                            Masuk untuk melihat data dan kegiatan sesuai peran Anda.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                        Masuk ke PKLConnect
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </GuestLayout>
    );
}
