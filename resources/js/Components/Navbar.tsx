import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sparkles, ArrowRight, ShieldCheck, Building2, GraduationCap } from 'lucide-react';
import { PageProps } from '@/Types';

export const Navbar: React.FC = () => {
    const { props } = usePage<PageProps>();
    const auth = props?.auth;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all duration-300">
            <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                {/* Brand Logo SMK Taruna Bangsa */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        TB
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                                Hubin SMK Taruna Bangsa
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                PKLConnect
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                            Portal Manajemen Praktik Kerja Lapangan & Kemitraan DUDI
                        </p>
                    </div>
                </Link>

                {/* Nav Links with Hover Micro-Animations */}
                <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    <a 
                        href="#galeri" 
                        className="relative py-1 text-slate-700 hover:text-emerald-600 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                        Galeri PKL
                    </a>
                    <a 
                        href="#mitra" 
                        className="relative py-1 text-slate-700 hover:text-emerald-600 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                        Mitra Industri
                    </a>
                    <a 
                        href="#alur" 
                        className="relative py-1 text-slate-700 hover:text-emerald-600 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                        Alur Siklus
                    </a>
                    <a 
                        href="#program" 
                        className="relative py-1 text-slate-700 hover:text-emerald-600 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                        Program Keahlian
                    </a>
                    <a 
                        href="#nexa" 
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold hover:bg-emerald-100 hover:scale-105 transition-all shadow-xs"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" /> NEXA AI
                    </a>
                </nav>

                {/* Action CTA */}
                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all duration-300"
                        >
                            <span>Dashboard Platform</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                            >
                                Masuk Portal
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 hover:shadow-emerald-600/50 transition-all duration-300"
                            >
                                <span>Coba Prototype PKL</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
