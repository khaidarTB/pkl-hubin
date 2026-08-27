import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { GuestLayout } from '@/Layouts/GuestLayout';
import { ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post('/login'); };

    return (
        <GuestLayout>
            <Head title="Masuk — PKLConnect" />
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80">
                    <div className="mb-6 text-center">
                        <h3 className="text-xl font-bold text-slate-900">Masuk ke PKLConnect</h3>
                        <p className="text-[13px] text-slate-500 mt-1">Gunakan email dan kata sandi yang terdaftar.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="nama@email.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Password</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
                        </div>
                        <button type="submit" disabled={processing}
                            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-3">
                            <span>{processing ? 'Masuk...' : 'Masuk'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-[12px] text-slate-500 mt-4">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">Daftar di sini</Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
