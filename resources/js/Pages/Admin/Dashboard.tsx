import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { Users, CheckCircle2, AlertTriangle, Building2, Sparkles, LineChart, FileSpreadsheet, ArrowUpRight, Bell, FileText, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
    stats: {
        total_students: number;
        pending_approval?: number;
        unplaced_students?: number;
        active_students: number;
        trouble_students: number;
        completed_students: number;
    };
    charts: {
        attendanceTrends: any[];
        journalCompletion: any[];
        statusDistribution: any[];
        industryDistribution: any[];
    };
    studentsMonitoring: any[];
    earlyWarning?: {
        mid_period_alert: boolean;
        period_progress: string;
        unvisited_count: number;
        low_attendance_count: number;
        incomplete_journal_count: number;
    };
}

export default function AdminDashboard({ stats, charts, studentsMonitoring, earlyWarning }: Props) {
    return (
        <DashboardLayout>
            <Head title="Admin Hubin Dashboard" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard Hubin</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Ringkasan aktivitas dan status PKL seluruh sekolah.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/pengajuan"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-[12px] hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4" />
                        <span>Pengajuan ({stats.pending_approval || 0})</span>
                    </Link>
                    <Link href="/admin/penempatan"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold text-[12px] hover:bg-slate-800 transition-colors">
                        <MapPin className="w-4 h-4" />
                        <span>Penempatan</span>
                    </Link>
                </div>
            </div>

            {/* Early Warning Banner (Mid-Period Alert) */}
            {earlyWarning?.mid_period_alert && (
                <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-md">
                            <Bell className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                                Peringatan Pertengahan Periode PKL ({earlyWarning.period_progress})
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">Sistem Early Warning Alert Monitoring Hubin</h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Terdeteksi <strong className="text-amber-700">{earlyWarning.unvisited_count} industri belum dikunjungi</strong> oleh Guru Pembimbing, dan <strong className="text-rose-700">{earlyWarning.low_attendance_count} siswa presensi di bawah 80%</strong>.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/kunjungan"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0"
                    >
                        <span>Jadwalkan Kunjungan Guru</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Siswa PKL"
                    value={`${stats.total_students} Siswa`}
                    description="Terdaftar dalam sistem"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Siswa PKL Aktif"
                    value={`${stats.active_students} Siswa`}
                    description="Sedang di lokasi industri"
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Perlu Perhatian"
                    value={`${stats.trouble_students} Siswa`}
                    description="Presensi < 80% / Jurnal kurang"
                    icon={AlertTriangle}
                    color="red"
                />
                <StatCard
                    title="Selesai PKL"
                    value={`${stats.completed_students} Siswa`}
                    description="Telah dinilai industri"
                    icon={Building2}
                    color="cyan"
                />
            </div>

            {/* Charts Grid (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 1. Tren Kehadiran Mingguan */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Tren Kehadiran Mingguan</h3>
                            <p className="text-xs text-slate-500">Perbandingan Hadir, Izin, dan Alpa</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">Live Data</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.attendanceTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="Hadir" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Izin" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Alpa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Status Penyelesaian Jurnal Harian */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Status Penyelesaian Jurnal</h3>
                            <p className="text-xs text-slate-500">Persentase E-Jurnal Terisi & Approved</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.journalCompletion}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                >
                                    {charts.journalCompletion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monitoring Siswa Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Daftar Monitoring Siswa PKL</h3>
                        <p className="text-xs text-slate-500">Klasifikasi otomatis status presensi & jurnal</p>
                    </div>
                        <Link
                            href="/monitoring"
                            className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                        <span>Lihat Semua Siswa</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Nama Siswa</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Perusahaan PKL</th>
                                <th className="p-4 text-center">Kehadiran</th>
                                <th className="p-4 text-center">Jurnal</th>
                                <th className="p-4 text-center">Status Siswa</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {studentsMonitoring.slice(0, 6).map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                                    <td className="p-4">{item.class} ({item.major})</td>
                                    <td className="p-4 text-slate-600">{item.industry}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${item.attendance_percent < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {item.attendance_percent}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{item.journal_count}</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={item.status} size="sm" />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/monitoring/siswa/${item.id}`}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 text-xs font-semibold transition-colors"
                                        >
                                            Detail
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
