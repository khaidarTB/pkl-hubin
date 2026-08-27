import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { Users, AlertTriangle, CalendarCheck, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
    supervisor: string;
    students: any[];
    stats: {
        total_supervised: number;
        attention_needed: number;
        avg_attendance: string;
    };
}

export default function GuruDashboard({ supervisor, students, stats }: Props) {
    return (
        <DashboardLayout>
            <Head title="Dashboard Guru Pembimbing" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard Guru Pembimbing</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Pembimbing: {supervisor}</p>
                </div>
                <Link
                    href="/ai/insights"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-[12px] hover:bg-slate-50 transition-colors"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>NEXA AI</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Siswa Bimbingan"
                    value={`${stats.total_supervised} Siswa`}
                    description="Siswa di bawah pengawasan Anda"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Membutuhkan Perhatian"
                    value={`${stats.attention_needed} Siswa`}
                    description="Presensi < 80% / Kendala Jurnal"
                    icon={AlertTriangle}
                    color="red"
                />
                <StatCard
                    title="Rata-rata Presensi"
                    value={stats.avg_attendance}
                    description="Tingkat Disiplin Bimbingan"
                    icon={CalendarCheck}
                    color="green"
                />
            </div>

            {/* Table Siswa Bimbingan */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base">Siswa Dalam Bimbingan Anda</h3>
                    <span className="text-xs text-slate-500 font-semibold">{students.length} Siswa</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase">
                            <tr>
                                <th className="p-4">NIS & Nama</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Tempat PKL</th>
                                <th className="p-4 text-center">Kehadiran</th>
                                <th className="p-4 text-center">Jurnal</th>
                                <th className="p-4 text-center">Status Risk</th>
                                <th className="p-4 text-right">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {students.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                        <p className="text-[10px] text-slate-400">NIS: {item.nis}</p>
                                    </td>
                                    <td className="p-4">{item.class} ({item.major})</td>
                                    <td className="p-4 font-semibold text-slate-700">{item.industry}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${item.attendance_percent < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {item.attendance_percent}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{item.journal_filled} Jurnal</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={item.status} size="sm" />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/monitoring/siswa/${item.id}`}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-[12px] transition-colors"
                                        >
                                            Pantau
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
