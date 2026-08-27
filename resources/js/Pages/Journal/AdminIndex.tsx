import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { BookOpen, Search, Filter } from 'lucide-react';

interface Props {
    journals: any[];
}

export default function JournalAdminIndex({ journals }: Props) {
    const [search, setSearch] = useState('');

    const filtered = journals.filter((j) => {
        const studentName = j.student?.user?.name || '';
        const activity = j.activity || '';
        return (
            studentName.toLowerCase().includes(search.toLowerCase()) ||
            activity.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <DashboardLayout>
            <Head title="Rekap E-Jurnal Siswa PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rekap E-Jurnal Siswa PKL</h1>
                    <p className="text-xs text-slate-500 mt-1">Pemantauan aktivitas dan pengisian jurnal harian siswa seluruh sekolah.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari nama siswa atau judul aktivitas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                </div>
            </div>

            {/* List Jurnal */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400">
                        Tidak ada jurnal harian ditemukan.
                    </div>
                ) : (
                    filtered.map((j) => (
                        <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-xs font-bold text-cyan-600 uppercase">{j.student?.user?.name || 'Siswa'}</span>
                                    <span className="text-[11px] font-mono text-slate-400 font-bold ml-2">({j.date})</span>
                                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{j.activity}</h3>
                                </div>
                                <StatusBadge status={j.status} />
                            </div>

                            <p className="text-xs text-slate-600 mt-4 leading-relaxed">{j.description}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
                                <span className="px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 font-semibold border border-cyan-100">
                                    Skill: {j.skill}
                                </span>
                                {j.obstacle && (
                                    <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium border border-rose-100">
                                        Kendala: {j.obstacle}
                                    </span>
                                )}
                                {j.solution && (
                                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                                        Solusi: {j.solution}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
