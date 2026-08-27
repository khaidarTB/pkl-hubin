import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { Search, Filter, LineChart, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
    students: any[];
}

export default function MonitoringIndex({ students }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');

    const filteredStudents = students.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                              s.nis.includes(search) || 
                              s.industry_name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = statusFilter === 'Semua' || s.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout>
            <Head title="Monitoring Real-Time Siswa PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monitoring Real-Time Siswa PKL</h1>
                    <p className="text-xs text-slate-500 mt-1">Pantau seluruh aktivitas siswa, persentase kehadiran, dan status penempatan.</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama siswa, NIS, atau tempat industri..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {['Semua', 'Aman', 'Perlu Perhatian', 'Bermasalah'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                                statusFilter === st
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Monitoring Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">NIS & Nama Siswa</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Tempat PKL (Industri)</th>
                                <th className="p-4">Pembimbing Sekolah</th>
                                <th className="p-4 text-center">Presensi (%)</th>
                                <th className="p-4 text-center">Total Jurnal</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredStudents.map((st) => (
                                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900">{st.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">NIS: {st.nis}</p>
                                    </td>
                                    <td className="p-4">{st.class} ({st.major})</td>
                                    <td className="p-4 text-slate-800 font-semibold">{st.industry_name}</td>
                                    <td className="p-4 text-slate-600">{st.school_supervisor}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${st.attendance_percent < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {st.attendance_percent}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{st.journal_filled} / 25</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={st.status} size="sm" />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/monitoring/siswa/${st.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold text-xs transition-colors"
                                        >
                                            <span>Buka</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
