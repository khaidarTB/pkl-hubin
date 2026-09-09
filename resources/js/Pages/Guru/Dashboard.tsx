import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { Users, AlertTriangle, CalendarCheck, Calendar, Eye, Edit3, ArrowRight, X, Search, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentItem {
    id: number;
    placement_id: number;
    name: string;
    email: string;
    nis: string;
    phone: string;
    class: string;
    major: string;
    industry: string;
    attendance_percent: number;
    journal_filled: number;
    status: string;
    placement_status: string;
    start_date: string;
    end_date: string;
}

interface Props {
    supervisor: string;
    students: StudentItem[];
    stats: {
        total_supervised: number;
        attention_needed: number;
        avg_attendance: string;
    };
}

export default function GuruDashboard({ supervisor, students, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
    const [editStatus, setEditStatus] = useState<string>('Aktif');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (student: StudentItem) => {
        setEditingStudent(student);
        setEditStatus(student.placement_status || 'Aktif');
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        setIsSubmitting(true);
        router.put(`/admin/penempatan/${editingStudent.placement_id}/quick-status`, {
            status: editStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingStudent(null);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false)
        });
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard Guru Pembimbing" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard Guru Pembimbing</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Pembimbing: <span className="font-semibold text-emerald-700">{supervisor}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/kunjungan"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>Jadwal Kunjungan</span>
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Siswa Dalam Bimbingan Anda</h3>
                        <p className="text-xs text-slate-500">Tersedia tombol Detail & Edit status untuk setiap siswa bimbingan.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari siswa, NIS, mitra..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-56"
                            />
                        </div>
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
                            {filteredStudents.length} Siswa
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">NIS & Nama</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Tempat PKL</th>
                                <th className="p-4 text-center">Kehadiran</th>
                                <th className="p-4 text-center">Jurnal</th>
                                <th className="p-4 text-center">Status PKL</th>
                                <th className="p-4 text-right">Aksi Table</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400">
                                        Tidak ada siswa bimbingan yang sesuai pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((item) => (
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
                                            <StatusBadge status={item.placement_status || item.status} size="sm" />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* DETAIL BUTTON */}
                                                <button
                                                    onClick={() => setSelectedStudent(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Lihat Detail Siswa"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Detail</span>
                                                </button>
                                                {/* EDIT BUTTON */}
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Edit Status Bimbingan"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                {/* MONITOR BUTTON */}
                                                <Link
                                                    href={`/monitoring/siswa/${item.id}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center gap-1"
                                                >
                                                    <span>Pantau</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETAIL SISWA */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Detail Siswa Bimbingan
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedStudent.name}</h3>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">NIS:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.nis}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Kelas & Jurusan:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.class} ({selectedStudent.major})</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Kontak:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Perusahaan Mitra:</span>
                                    <span className="font-bold text-slate-900">{selectedStudent.industry}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Periode PKL:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.start_date} s/d {selectedStudent.end_date}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Penempatan:</span>
                                    <StatusBadge status={selectedStudent.placement_status || selectedStudent.status} size="sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-emerald-700 font-semibold text-[11px]">Tingkat Kehadiran</span>
                                    <p className="text-xl font-bold text-emerald-800 mt-0.5">{selectedStudent.attendance_percent}%</p>
                                </div>
                                <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                                    <span className="text-cyan-700 font-semibold text-[11px]">Jurnal Terisi</span>
                                    <p className="text-xl font-bold text-cyan-800 mt-0.5">{selectedStudent.journal_filled} Jurnal</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                            <button
                                onClick={() => {
                                    const st = selectedStudent;
                                    setSelectedStudent(null);
                                    openEditModal(st);
                                }}
                                className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Status</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                    Tutup
                                </button>
                                <Link
                                    href={`/monitoring/siswa/${selectedStudent.id}`}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
                                >
                                    <span>Monitoring Detail</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDIT STATUS SISWA */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase">
                                    Edit Status PKL Siswa
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingStudent.name}</h3>
                                <p className="text-xs text-slate-500">Mitra: {editingStudent.industry}</p>
                            </div>
                            <button onClick={() => setEditingStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Penempatan Saat Ini</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50 font-medium"
                                >
                                    <option value="Aktif">Aktif (Sedang Berjalan Lancar)</option>
                                    <option value="Bermasalah">Bermasalah (Ada Kendala / Perlu Penanganan)</option>
                                    <option value="Selesai">Selesai (Telah Menyelesaikan Masa PKL)</option>
                                    <option value="Dibatalkan">Dibatalkan (Penarikan / Batal PKL)</option>
                                </select>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                                <span>Perubahan status akan langsung tercatat dan diperbarui pada sistem monitoring sekolah dan mitra industri.</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
