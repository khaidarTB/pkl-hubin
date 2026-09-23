import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Heart, Building2 } from 'lucide-react';

const supportersLogo = [
    "/img/supporters/jhic_2.png",
    "/img/supporters/jagoan_hosting_logo.png",
    "/img/supporters/komdigi.png",
    "/img/supporters/garuda_spark.png",
    "/img/supporters/ngalup.png",
]

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-white border-t border-slate-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xl">
                                <img src="/img/pklconnect_logo.png" alt="pklconnect logo" />
                            </div>
                            <div>
                                <span className="font-extrabold text-xl tracking-tight block">Hubin SMK Taruna Bangsa</span>
                                <span className="text-xs text-cyan-400 font-semibold">PKLConnect Management System</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                            Sistem Informasi Hubungan Industri & Monitoring Praktik Kerja Lapangan (PKL) Terintegrasi SMK Taruna Bangsa. Mengelola sinergi antara siswa vokasi, guru pembimbing, dan perusahaan mitra nasional.
                        </p>
                        <p className="text-xs text-cyan-400 font-bold mt-4">
                            "Vokasi Unggul, Kemitraan Industri Nyata, Masa Depan Gemilang."
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Modul Platform</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Pendaftaran & Approval Hubin</Link></li>
                            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Absensi GPS Geolocation</Link></li>
                            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">E-Jurnal Real-time Siswa</Link></li>
                            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Surat Tugas & TTD Digital</Link></li>
                            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Penilaian Industri Standard 7 Aspek</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Kemitraan Industri</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Sektor Kerja Sama: Rekayasa Perangkat Lunak, Teknik Komputer & Jaringan, DKV, Teknik Otomotif.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
                            <ShieldCheck className="w-4 h-4" /> Terverifikasi DUDI & Vokasi
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>© 2026 Hubin SMK Taruna Bangsa — PKLConnect System. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Didukung oleh : 
                    <div className="container-supporters-logo">
                        {
                        supportersLogo.map((supporterLogo, i) => {
                            return (
                                <img key={i} className='w-15 h-auto' src={supporterLogo} alt="" />
                            )
                        })
                    }
                    </div>
                    </p>
                </div>
            </div>
        </footer>
    );
};
