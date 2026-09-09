import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { CheckSquare, GraduationCap, Users, Clock, Check, X, Sparkles, Eye, Edit3, Search, Phone, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentItem {
    id: number;
    placement_id: number;
    name: string;
    nis: string;
    email: string;
    phone: string;
    class: string;
    major: string;
    status: string;
    pending_journals: number;
    has_assessment: boolean;
    score: number | null;
    start_date: string;
    end_date: string;
}

interface PendingJournal {
    id: number;
    date: string;
    activity: string;
    description: string;
    skill: string;
    attachment_path?: string;
    student: {
        id: number;
        user: {
            name: string;
            email: string;
        };
    };
}

interface Props {
    supervisor: string;
    students: StudentItem[];
    pendingApprovals: PendingJournal[];
}

export default function IndustriDashboard({ supervisor, students, pendingApprovals }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [selectedJournal, setSelectedJournal] = useState<PendingJournal | null>(null);
    const [revisionModalJournal, setRevisionModalJournal] = useState<PendingJournal | null>(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = (id: number) => {
        router.put(`/jurnal/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedJournal?.id === id) setSelectedJournal(null);
            }
        });
    };

    const handleRevisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!revisionModalJournal || !revisionNote.trim()) return;
        setIsSubmitting(true);
        router.put(`/jurnal/${revisionModalJournal.id}/revision`, { revision_note: revisionNote }, {
            preserveScroll: true,
            onSuccess: () => {
                setRevisionModalJournal(null);
                setRevisionNote('');
                setIsSubmitting(false);
                if (selectedJournal?.id === revisionModalJournal.id) setSelectedJournal(null);
            },
            onError: () => setIsSubmitting(false)
        });
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard Pembimbing Industri" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Portal Pembimbing Industri</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Pembimbing: <span className="font-semibold text-emerald-700">{supervisor}</span></p>
                </div>
                <Link
                    href="/penilaian"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Lembar Penilaian PKL</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <StatCard
                    title="Jurnal Menunggu Approval"
                    value={`${pendingApprovals.length} Jurnal`}
                    description="Perlu verifikasi harian"
                    icon={CheckSquare}
                    color="amber"
                />
                <StatCard
                    title="Siswa PKL Industri"
                    value={`${students.length} Siswa`}
                    description="Dibimbing di perusahaan Anda"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Penilaian Terinput"
                    value={`${students.filter(s => s.has_assessment).length} / ${students.length}`}
                    description="Lembar penilaian kompetensi"
                    icon={GraduationCap}
                    color="green"
                />
            </div>

            {/* Pending Approvals Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Approval Jurnal Kegiatan Siswa</h3>
                        <p className="text-xs text-slate-500">Verifikasi deskripsi pekerjaan & skill harian siswa</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {pendingApprovals.length} Menunggu Verifikasi
                    </span>
                </div>

                {pendingApprovals.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                        Semua jurnal siswa telah disetujui! 🎉
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingApprovals.map((j) => (
                            <div key={j.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm">{j.student.user.name}</span>
                                        <span className="text-[11px] text-slate-500 font-medium">({j.date})</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">{j.activity}</h4>
                                    <p className="text-xs text-slate-600 line-clamp-2">{j.description}</p>
                                    <p className="text-[11px] text-emerald-700 font-semibold">Skill: {j.skill}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setSelectedJournal(j)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs transition-colors"
                                        title="Lihat Detail Jurnal"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Detail</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprove(j.id)}
                                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Setujui</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRevisionModalJournal(j);
                                            setRevisionNote('');
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Revisi</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Table Siswa Bimbingan Industri */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Daftar Siswa Bimbingan Industri</h3>
                        <p className="text-xs text-slate-500">Tinjau profil siswa, progres jurnal, dan lembar penilaian.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari siswa, NIS, kelas..."
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
                                <th className="p-4 text-center">Jurnal Perlu Review</th>
                                <th className="p-4 text-center">Status Penilaian</th>
                                <th className="p-4 text-center">Status PKL</th>
                                <th className="p-4 text-right">Aksi Table</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">
                                        Tidak ada siswa bimbingan industri.
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
                                        <td className="p-4 text-center">
                                            {item.pending_journals > 0 ? (
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                                                    {item.pending_journals} Pending
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-semibold">Semua OK</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {item.has_assessment ? (
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                                                    Nilai: {item.score ?? '-'}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-semibold rounded-lg">
                                                    Belum Dinilai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={item.status || 'Aktif'} size="sm" />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* DETAIL BUTTON */}
                                                <button
                                                    onClick={() => setSelectedStudent(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Lihat Profil Lengkap Siswa"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Detail</span>
                                                </button>
                                                {/* EDIT / NILAI BUTTON */}
                                                <Link
                                                    href="/penilaian"
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Input / Edit Penilaian Kompetensi Siswa"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>{item.has_assessment ? 'Edit Nilai' : 'Input Nilai'}</span>
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

            {/* MODAL DETAIL JURNAL */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase">
                                    Verifikasi Jurnal Harian
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedJournal.student.user.name}</h3>
                                <p className="text-xs text-slate-400 font-mono">Tanggal Kegiatan: {selectedJournal.date}</p>
                            </div>
                            <button onClick={() => setSelectedJournal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">Judul Aktivitas</span>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedJournal.activity}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">Deskripsi Pekerjaan</span>
                                    <p className="text-slate-700 leading-relaxed mt-0.5 whitespace-pre-line">{selectedJournal.description}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                                    <span className="text-slate-500 font-bold">Keterampilan / Skill:</span>
                                    <span className="font-bold text-emerald-700">{selectedJournal.skill}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
                            <button
                                onClick={() => setSelectedJournal(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    setRevisionModalJournal(selectedJournal);
                                    setRevisionNote('');
                                }}
                                className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-100 flex items-center gap-1 border border-rose-200"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Minta Revisi</span>
                            </button>
                            <button
                                onClick={() => handleApprove(selectedJournal.id)}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1 shadow-md shadow-emerald-600/20"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui Jurnal</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REVISI JURNAL */}
            {revisionModalJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold uppercase">
                                    Catatan Revisi Jurnal
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{revisionModalJournal.student.user.name}</h3>
                                <p className="text-xs text-slate-500">{revisionModalJournal.activity}</p>
                            </div>
                            <button onClick={() => setRevisionModalJournal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRevisionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alasan & Petunjuk Perbaikan untuk Siswa</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={revisionNote}
                                    onChange={(e) => setRevisionNote(e.target.value)}
                                    placeholder="Contoh: Deskripsi kegiatan terlalu singkat, mohon jabarkan langkah perbaikan laptop dan komponen yang diganti..."
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none p-3 bg-slate-50 font-medium leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setRevisionModalJournal(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !revisionNote.trim()}
                                    className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Catatan Revisi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL SISWA */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Detail Siswa PKL
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
                                    <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Kontak Siswa:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Periode PKL:</span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.start_date} s/d {selectedStudent.end_date}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Siswa:</span>
                                    <StatusBadge status={selectedStudent.status || 'Aktif'} size="sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <span className="text-amber-700 font-semibold text-[11px]">Jurnal Pending</span>
                                    <p className="text-xl font-bold text-amber-800 mt-0.5">{selectedStudent.pending_journals} Jurnal</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-emerald-700 font-semibold text-[11px]">Nilai PKL</span>
                                    <p className="text-xl font-bold text-emerald-800 mt-0.5">{selectedStudent.has_assessment ? selectedStudent.score : 'Belum Ada'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                            <Link
                                href="/penilaian"
                                className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{selectedStudent.has_assessment ? 'Ubah Penilaian' : 'Beri Nilai Sekarang'}</span>
                            </Link>
                            <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
