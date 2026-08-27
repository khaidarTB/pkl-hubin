import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { GuestLayout } from '@/Layouts/GuestLayout';
import { ArrowRight, UserPlus, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', nis: '', class: '', major: '', phone: '',
        password: '', password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Registrasi Siswa — PKLConnect" />
            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left: Info */}
                    <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold mb-5">
                                <UserPlus className="w-3.5 h-3.5" /> Daftar Akun Siswa
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Registrasi Siswa PKL</h2>
                            <p className="text-slate-400 text-[13px] mt-1.5">Buat akun untuk mengikuti program Praktik Kerja Lapangan.</p>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-white">Langkah 1: Daftar Akun</p>
                                        <p className="text-[11px] text-slate-400">Isi data diri dan informasi sekolah kamu.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-white">Langkah 2: Daftar PKL</p>
                                        <p className="text-[11px] text-slate-400">Pilih perusahaan mitra dan ajukan pendaftaran.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-white">Langkah 3: Mulai PKL</p>
                                        <p className="text-[11px] text-slate-400">Absen harian, isi jurnal, dan pantai progres.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-5 mt-5 border-t border-white/10 text-[11px] text-slate-400">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold">Masuk di sini</Link>
                        </div>
                    </div>

                    {/* Right: Register Form */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 flex flex-col justify-center">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Formulir Registrasi</h3>
                            <p className="text-[13px] text-slate-500 mt-1">Lengkapi data diri kamu untuk mendaftar.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Masukkan nama lengkap"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="nama@email.com"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa)</label>
                                <input type="text" value={data.nis} onChange={(e) => setData('nis', e.target.value)} placeholder="Contoh: 2023001"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                {errors.nis && <p className="text-[11px] text-rose-500 mt-1">{errors.nis}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kelas</label>
                                    <input type="text" value={data.class} onChange={(e) => setData('class', e.target.value)} placeholder="XII RPL 1"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                    {errors.class && <p className="text-[11px] text-rose-500 mt-1">{errors.class}</p>}
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Jurusan</label>
                                    <input type="text" value={data.major} onChange={(e) => setData('major', e.target.value)} placeholder="RPL"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                    {errors.major && <p className="text-[11px] text-rose-500 mt-1">{errors.major}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">No. Telepon <span className="text-slate-400 font-normal">(opsional)</span></label>
                                <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="08xxxxxxxxxx"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password</label>
                                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Min. 6 karakter"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                    {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Konfirmasi Password</label>
                                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Ulangi password"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                                </div>
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-3">
                                <span>{processing ? 'Memproses...' : 'Daftar Sekarang'}</span>
                                {!processing && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                        <p className="text-center text-[12px] text-slate-500 mt-4">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">Masuk</Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
