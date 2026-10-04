import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { PageProps } from '@/Types';

export const Navbar: React.FC = () => {
    const { props } = usePage<PageProps>();
    const auth = props?.auth;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all duration-300">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
                {/* Brand Logo SMK Taruna Bangsa */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr flex items-center justify-center font-black text-white text-base sm:text-xl group-hover:scale-105 transition-all duration-300 shrink-0">
                        <img src="/img/pklconnect_logo.png" alt="pklconnect logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-black text-xs sm:text-lg lg:text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                SMK Taruna Bangsa
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                PKLConnect
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold hidden md:block truncate">
                            Portal Manajemen Praktik Kerja Lapangan & Kemitraan DUDI
                        </p>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-extrabold uppercase tracking-wider text-slate-700">
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
                        <Sparkles className="w-4 h-4 text-emerald-600" /> NEXA AI
                    </a>
                </nav>

                {/* Action CTA & Mobile Menu Button */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-emerald-600/30 hover:scale-105 transition-all duration-300 whitespace-nowrap"
                        >
                            <span>Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all whitespace-nowrap"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-emerald-600/30 hover:scale-105 hover:shadow-emerald-600/50 transition-all duration-300 whitespace-nowrap"
                            >
                                <span>Prototype PKL</span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
                    <a
                        href="#galeri"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-extrabold uppercase text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                        Galeri PKL
                    </a>
                    <a
                        href="#mitra"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-extrabold uppercase text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                        Mitra Industri
                    </a>
                    <a
                        href="#alur"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-extrabold uppercase text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                        Alur Siklus
                    </a>
                    <a
                        href="#program"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-extrabold uppercase text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                        Program Keahlian
                    </a>
                    {!auth?.user && (
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-xs font-extrabold uppercase text-emerald-700 bg-emerald-50"
                        >
                            Masuk Portal PKL
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
};
