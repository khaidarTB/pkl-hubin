import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { PklApplication } from '@/Types';
import { FileText, Search, Filter, Check, XCircle, RefreshCw } from 'lucide-react';

interface Props {
    applications: PklApplication[];
    stats: { total: number; pending: number; revision: number; approved: number; rejected: number };
}

export default function ApplicationsIndex({ applications, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedApp, setSelectedApp] = useState<PklApplication | null>(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [activeModal, setActiveModal] = useState<'approve' | 'revision' | 'reject' | null>(null);

    const filtered = applications.filter((app) => {
        const matchesSearch = app.student?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleApprove = (id: number) => {
        router.post(`/admin/pengajuan/${id}/approve`, {}, { onSuccess: () => setActiveModal(null) });
    };
    const handleRevision = (id: number) => {
        if (!revisionNote.trim()) return;
        router.post(`/admin/pengajuan/${id}/revision`, { revision_note: revisionNote }, { onSuccess: () => { setActiveModal(null); setRevisionNote(''); } });
    };
    const handleReject = (id: number) => {
        if (!rejectReason.trim()) return;
        router.post(`/admin/pengajuan/${id}/reject`, { rejection_reason: rejectReason }, { onSuccess: () => { setActiveModal(null); setRejectReason(''); } });
    };

    return (
        <DashboardLayout>
            <Head title="Manajemen Pengajuan PKL" />
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Pengajuan PKL</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Verifikasi dan kelola pendaftaran PKL siswa.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80">
                        <p className="text-[11px] text-slate-500 font-medium">Total</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-amber-200/80">
                        <p className="text-[11px] text-amber-600 font-medium">Menunggu</p>
                        <p className="text-xl font-bold text-amber-700 mt-0.5">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-orange-200/80">
                        <p className="text-[11px] text-orange-600 font-medium">Revisi</p>
                        <p className="text-xl font-bold text-orange-700 mt-0.5">{stats.revision}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-200/80">
                        <p className="text-[11px] text-emerald-600 font-medium">Disetujui</p>
                        <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats.approved}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-rose-200/80">
                        <p className="text-[11px] text-rose-600 font-medium">Ditolak</p>
                        <p className="text-xl font-bold text-rose-700 mt-0.5">{stats.rejected}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari siswa atau perusahaan..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                            <option value="all">Semua Status</option>
                            <option value="submitted">Menunggu</option>
                            <option value="revision">Revisi</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Siswa</th>
                                    <th className="px-5 py-3">Perusahaan</th>
                                    <th className="px-5 py-3">Posisi</th>
                                    <th className="px-5 py-3">Tanggal</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[12px]">
                                {filtered.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-900">{app.student?.user?.name || 'Siswa'}</p>
                                            <p className="text-[11px] text-slate-400">{app.student?.class} - {app.student?.nis}</p>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-700">{app.company_name}</td>
                                        <td className="px-5 py-3 text-slate-600">{app.desired_position}</td>
                                        <td className="px-5 py-3 text-slate-500">
                                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                app.status === 'submitted' ? 'bg-amber-50 text-amber-700' :
                                                app.status === 'revision' ? 'bg-orange-50 text-orange-700' :
                                                'bg-rose-50 text-rose-700'
                                            }`}>
                                                {app.status === 'submitted' ? 'Menunggu' : app.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setSelectedApp(app); setActiveModal('approve'); }}
                                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Setujui">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setSelectedApp(app); setActiveModal('revision'); }}
                                                    className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50" title="Revisi">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setSelectedApp(app); setActiveModal('reject'); }}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" title="Tolak">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-[13px]">Tidak ada pengajuan ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal && selectedApp && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <h3 className="text-base font-bold text-slate-900">
                            {activeModal === 'approve' && 'Setujui Pengajuan PKL'}
                            {activeModal === 'revision' && 'Minta Revisi'}
                            {activeModal === 'reject' && 'Tolak Pengajuan'}
                        </h3>
                        <p className="text-[12px] text-slate-500">
                            Siswa: <span className="font-semibold text-slate-900">{selectedApp.student?.user?.name}</span> ({selectedApp.company_name})
                        </p>
                        {activeModal === 'revision' && (
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Catatan Revisi</label>
                                <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={3}
                                    placeholder="Jelaskan yang perlu diperbaiki..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                        )}
                        {activeModal === 'reject' && (
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Alasan Penolakan</label>
                                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                                    placeholder="Alasan penolakan..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            {activeModal === 'approve' && <button onClick={() => handleApprove(selectedApp.id)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700">Setujui</button>}
                            {activeModal === 'revision' && <button onClick={() => handleRevision(selectedApp.id)} className="px-4 py-2 bg-orange-600 text-white font-bold text-[12px] rounded-xl hover:bg-orange-700">Kirim Revisi</button>}
                            {activeModal === 'reject' && <button onClick={() => handleReject(selectedApp.id)} className="px-4 py-2 bg-rose-600 text-white font-bold text-[12px] rounded-xl hover:bg-rose-700">Tolak</button>}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
