import React from 'react';
import { Link } from '@inertiajs/react';

const supporters = [
    { name: 'JHIC', logo: '/img/supporters/jhic_2.png' },
    { name: 'Jagoan Hosting', logo: '/img/supporters/jagoan_hosting_logo.png' },
    { name: 'Komdigi', logo: '/img/supporters/komdigi.png' },
    { name: 'Garuda Spark', logo: '/img/supporters/garuda_spark.png' },
    { name: 'Ngalup', logo: '/img/supporters/ngalup.png' },
];

const footerLinks = [
    { label: 'Perusahaan mitra', href: '/#mitra' },
    { label: 'Program keahlian', href: '/#program' },
    { label: 'Alur PKL', href: '/#alur' },
];

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12">
                <div className="grid gap-8 sm:grid-cols-[1.3fr_0.7fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                            <img
                                src="/img/pklconnect_logo_white.png"
                                alt=""
                                className="h-10 w-10 object-contain"
                            />
                            <span>
                                <span className="block font-semibold text-white">PKLConnect</span>
                                <span className="block text-sm text-slate-400">
                                    SMK Taruna Bangsa
                                </span>
                            </span>
                        </Link>
                        <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                            Portal untuk mengelola pengajuan, penempatan, pemantauan, dan
                            penilaian Praktik Kerja Lapangan.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-white">Jelajahi</h2>
                        <ul className="mt-3 space-y-2">
                            {footerLinks.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="rounded-sm text-sm text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/login"
                                    className="rounded-sm text-sm text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                >
                                    Login pengguna
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-5 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-400">
                        © 2026 Hubin SMK Taruna Bangsa · PKLConnect
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <span className="text-xs text-slate-400">Didukung oleh</span>
                        {supporters.map((supporter) => (
                            <img
                                key={supporter.name}
                                src={supporter.logo}
                                alt={supporter.name}
                                className="h-6 w-auto max-w-24 object-contain opacity-80"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
