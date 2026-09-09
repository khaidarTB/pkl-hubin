import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { 
    Users, CheckCircle2, AlertTriangle, Building2, 
    ArrowUpRight, Bell, FileText, MapPin, ArrowRight,
    Search, Edit3, Eye, Plus, Calendar, GraduationCap, X, Check, Phone, Mail
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

interface Teacher {
    id: number;
    name: string;
}

interface StudentMonitoringItem {
    id: number;
    placement_id?: number;
    name: string;
    email?: string;
    nis?: string;
    class: string;
    major: string;
    phone?: string;
    industry: string;
    attendance_percent: number;
    journal_count: string;
    status: string;
    placement_status?: string;
    school_supervisor_id?: number;
    school_supervisor?: string;
    start_date?: string;
    end_date?: string;
}

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
    studentsMonitoring: StudentMonitoringItem[];
    earlyWarning?: {
        mid_period_alert: boolean;
        period_progress: string;
        unvisited_count: number;
        low_attendance_count: number;
        incomplete_journal_count: number;
    };
    teachers?: Teacher[];
}

export default function AdminDashboard({ stats, charts, studentsMonitoring, earlyWarning, teachers = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<StudentMonitoringItem | null>(null);
    const [selectedEdit, setSelectedEdit] = useState<StudentMonitoringItem | null>(null);

    // Edit Modal Form State
    const [editStatus, setEditStatus] = useState<'Aktif' | 'Bermasalah' | 'Selesai' | 'Dibatalkan'>('Aktif');
    const [editSupervisorId, setEditSupervisorId] = useState<number | string>('');
    const [isSaving, setIsSaving] = useState(false);

    const openEditModal = (item: StudentMonitoringItem) => {
        setSelectedEdit(item);
        setEditStatus((item.placement_status as any) || 'Aktif');
        setEditSupervisorId(item.school_supervisor_id || '');
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEdit || !selectedEdit.placement_id) {
            // If student has no placement yet, redirect to placement page
            router.get('/admin/penempatan');
            return;
        }

        setIsSaving(true);
        router.put(`/admin/penempatan/${selectedEdit.placement_id}/quick-status`, {
            status: editStatus,
            school_supervisor_id: editSupervisorId || null,
        }, {
            onSuccess: () => {
                setSelectedEdit(null);
                setIsSaving(false);
            },
            onError: () => {
                setIsSaving(false);
            }
        });
    };

    const filteredStudents = studentsMonitoring.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.nis && s.nis.includes(searchTerm))
    );

    return (
        <DashboardLayout>
            <Head title="Admin Hubin Dashboard" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard Hubin</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Ringkasan aktivitas, status PKL, dan pusat kontrol data siswa.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Link href="/admin/pengajuan"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-[12px] hover:bg-slate-50 transition-colors shadow-sm">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Pengajuan ({stats.pending_approval || 0})</span>
                    </Link>
                    <Link href="/admin/penempatan"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-[12px] hover:bg-slate-800 transition-colors shadow-sm">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Penempatan Siswa</span>
                    </Link>
                </div>
            </div>

            {/* Quick Actions Bar (Pusat Aksi Cepat Tambah & Kelola Data) */}
            <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Aksi Cepat Data</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Link href="/admin/perusahaan"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 font-semibold transition-all">
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Perusahaan Mitra</span>
                        </Link>
                        <Link href="/admin/penempatan"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 font-semibold transition-all">
                            <Plus className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Tempatkan Siswa</span>
                        </Link>
                        <Link href="/admin/siswa"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 font-semibold transition-all">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Kelola Siswa</span>
                        </Link>
                        <Link href="/admin/guru"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-semibold transition-all">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>Kelola Guru</span>
                        </Link>
                        <Link href="/admin/periode"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 font-semibold transition-all">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>Periode PKL</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Early Warning Banner */}
            {earlyWarning?.mid_period_alert && (
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
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

            {/* Monitoring Siswa Table dengan Aksi Detail & Edit Lengkap */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Daftar Monitoring & Pengelolaan Siswa PKL</h3>
                        <p className="text-xs text-slate-500">Gunakan tombol <strong>Detail</strong> untuk melihat biodata dan <strong>Edit</strong> untuk memperbarui status penempatan.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-56 sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari siswa atau industri..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <Link
                            href="/monitoring"
                            className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
                        >
                            <span>Lihat Semua</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
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
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Aksi Table</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                                        Tidak ada data siswa yang cocok dengan pencarian "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.slice(0, 8).map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                            <p className="text-[10px] text-slate-400">{item.nis ? `NIS: ${item.nis}` : item.email}</p>
                                        </td>
                                        <td className="p-4">{item.class} ({item.major})</td>
                                        <td className="p-4 text-slate-600 font-medium">{item.industry}</td>
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
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Tombol DETAIL */}
                                                <button
                                                    onClick={() => setSelectedDetail(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Lihat Detail Siswa"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Detail</span>
                                                </button>

                                                {/* Tombol EDIT */}
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Edit Status & Data Penempatan"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL DETAIL SISWA ================= */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Detail Siswa PKL
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedDetail.name}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-slate-400 text-[11px]">NIS</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{selectedDetail.nis || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[11px]">Kelas & Jurusan</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{selectedDetail.class} ({selectedDetail.major})</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[11px]">Email Siswa</p>
                                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span className="truncate">{selectedDetail.email || '-'}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[11px]">No. Telepon / WA</p>
                                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span>{selectedDetail.phone || '-'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <p className="text-slate-400 text-[11px] font-bold uppercase">Informasi Penempatan Industri</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-slate-500">Perusahaan Mitra:</span>
                                        <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.industry}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Guru Pembimbing:</span>
                                        <p className="font-semibold text-slate-800 mt-0.5">{selectedDetail.school_supervisor || 'Belum Ditugaskan'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Periode Pelaksanaan:</span>
                                        <p className="font-medium text-slate-700 mt-0.5">{selectedDetail.start_date || '-'} s/d {selectedDetail.end_date || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Status Penempatan:</span>
                                        <div className="mt-0.5">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                {selectedDetail.placement_status || 'Aktif'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <span className="text-emerald-700 text-[11px] font-semibold">Tingkat Presensi</span>
                                    <p className="text-lg font-bold text-emerald-800 mt-0.5">{selectedDetail.attendance_percent}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                                    <span className="text-cyan-700 text-[11px] font-semibold">Jurnal Harian</span>
                                    <p className="text-lg font-bold text-cyan-800 mt-0.5">{selectedDetail.journal_count}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100 mt-5">
                            <Link
                                href={`/monitoring/siswa/${selectedDetail.id}`}
                                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                            >
                                <span>Buka Riwayat Lengkap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                                onClick={() => {
                                    const itm = selectedDetail;
                                    setSelectedDetail(null);
                                    openEditModal(itm);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Penempatan Ini</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL EDIT DATA SISWA / STATUS ================= */}
            {selectedEdit && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Edit Status Penempatan
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedEdit.name}</h3>
                                <p className="text-[11px] text-slate-500">{selectedEdit.industry}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEdit(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Status Penempatan PKL
                            </label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="Aktif">🟢 Aktif (Sedang Berlangsung)</option>
                                <option value="Bermasalah">🔴 Bermasalah (Perlu Tindakan Intervensi)</option>
                                <option value="Selesai">🔵 Selesai (Tuntas Periode)</option>
                                <option value="Dibatalkan">⚪ Dibatalkan</option>
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">Mengubah status akan memperbarui indikator pada dashboard & laporan monitoring.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Tugaskan Guru Pembimbing
                            </label>
                            <select
                                value={editSupervisorId}
                                onChange={(e) => setEditSupervisorId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="">-- Pilih Guru Pembimbing --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">Guru yang ditugaskan dapat memantau presensi dan menjadwalkan kunjungan.</p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedEdit(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                            >
                                <Check className="w-4 h-4" />
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}

