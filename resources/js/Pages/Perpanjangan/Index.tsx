import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { PklExtension, Placement, PageProps } from '@/Types';
import { 
    Calendar, Plus, Search, FileText, CheckCircle2, XCircle, 
    Clock, Download, Filter, AlertCircle, ChevronRight, UserCheck, 
    Building2, GraduationCap, X, Check, ArrowRight
} from 'lucide-react';

interface Props {
    extensions: PklExtension[];
    myPlacements: Placement[];
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export default function ExtensionIndex({ 
    extensions = [], 
    myPlacements = [], 
    stats = { total: 0, pending: 0, approved: 0, rejected: 0 } 
}: Props) {
    const page = usePage<PageProps>();
    const userRole = page.props?.auth?.user?.role || 'siswa';

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [reviewingExtension, setReviewingExtension] = useState<PklExtension | null>(null);
    const [detailExtension, setDetailExtension] = useState<PklExtension | null>(null);

    // Create Form Hook
    const createForm = useForm({
        placement_id: '',
        requested_start_date: '',
        requested_end_date: '',
        reason: '',
        extension_letter: null as File | null,
    });

    // Review Form Hook
    const reviewForm = useForm({
        review_feedback: '',
    });

    // Handle placement selection change in create form
    const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);

    const handlePlacementChange = (placementId: string) => {
        createForm.setData('placement_id', placementId);
        const found = (myPlacements || []).find(p => p.id.toString() === placementId) || null;
        setSelectedPlacement(found);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/perpanjangan', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                setSelectedPlacement(null);
            },
        });
    };

    const handleReviewSubmit = (action: 'approve' | 'reject') => {
        if (!reviewingExtension) return;
        
        // Post review request
        router.post(`/perpanjangan/${reviewingExtension.id}/${action}`, {
            review_feedback: reviewForm.data.review_feedback,
        }, {
            onSuccess: () => {
                setReviewingExtension(null);
                reviewForm.reset();
            }
        });
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const extendedDays = (item: PklExtension) => {
        const start = new Date(item.old_end_date).getTime();
        const end = new Date(item.requested_end_date).getTime();
        return Math.max(1, Math.round((end - start) / 86400000));
    };

    const canDownloadFile = (item: PklExtension) =>
        !!item.extension_letter_path &&
        (userRole === 'admin' || item.requested_by === page.props?.auth?.user?.id);

    // Filtered extensions
    const filteredExtensions = (extensions || []).filter(item => {
        const studentName = item.student?.user?.name || '';
        const companyName = item.placement?.company?.name || '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        Ditolak
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Menunggu Review
                    </span>
                );
        }
    };

    return (
        <DashboardLayout>
            <Head title="Perpanjangan PKL" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Perpanjangan PKL</h1>
                                <p className="text-[13px] text-slate-500 mt-0.5">
                                    Kelola dan ajukan perpanjangan durasi tempat Praktik Kerja Lapangan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {(userRole === 'guru' || userRole === 'admin' || userRole === 'industri') && (myPlacements || []).length > 0 && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all duration-200 active:scale-95 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Ajukan Perpanjangan
                        </button>
                    )}
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Permohonan</p>
                            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Menunggu Review</p>
                            <p className="text-xl font-bold text-amber-600 mt-0.5">{stats.pending}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Disetujui</p>
                            <p className="text-xl font-bold text-emerald-600 mt-0.5">{stats.approved}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Ditolak</p>
                            <p className="text-xl font-bold text-rose-600 mt-0.5">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari siswa atau perusahaan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
                            <Filter className="w-3.5 h-3.5" /> Filter:
                        </span>
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'approved', label: 'Disetujui' },
                            { id: 'rejected', label: 'Ditolak' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                    statusFilter === f.id
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Extension Requests Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Siswa</th>
                                    <th className="px-5 py-3.5">Perusahaan</th>
                                    <th className="px-5 py-3.5">Tanggal Berakhir</th>
                                    <th className="px-5 py-3.5">Perpanjangan</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Pengaju</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredExtensions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="font-medium text-slate-600">Belum ada pengajuan perpanjangan PKL</p>
                                            <p className="text-[11px] mt-0.5">Pengajuan yang dibuat akan muncul di tabel ini.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExtensions.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {item.student?.user?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{item.student?.user?.name || '-'}</p>
                                                        <p className="text-[11px] text-slate-500">
                                                            NIS: {item.student?.nis || '-'} • {item.student?.class || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-medium text-slate-800">
                                                        {item.placement?.company?.name || item.placement?.industry?.name || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-600">
                                                    <span className="line-through text-slate-400">{formatDate(item.old_end_date)}</span>
                                                    <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" />
                                                    <span className="font-semibold text-emerald-600">{formatDate(item.requested_end_date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                                    +{extendedDays(item)} hari
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <p className="font-medium">{item.requester?.name || '-'}</p>
                                                <p className="text-[10px] text-slate-400 capitalize">{item.requester?.role || 'Pembimbing'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right space-x-1">
                                                <button
                                                    onClick={() => setDetailExtension(item)}
                                                    className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    Detail
                                                </button>
                                                
                                                {userRole === 'admin' && item.status === 'pending' && (
                                                    <button
                                                        onClick={() => setReviewingExtension(item)}
                                                        className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: FORM AJUKAN PERPANJANGAN */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Form Pengajuan Perpanjangan PKL</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
                            {/* Select Student / Placement */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa PKL *</label>
                                <select
                                    value={createForm.data.placement_id}
                                    onChange={(e) => handlePlacementChange(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Pilih Siswa Penempatan --</option>
                                    {(myPlacements || []).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.student?.user?.name} - {p.company?.name || p.industry?.name || 'Perusahaan'} (Akhir: {formatDate(p.end_date)})
                                        </option>
                                    ))}
                                </select>
                                {createForm.errors.placement_id && (
                                    <p className="text-rose-500 text-[11px] mt-1">{createForm.errors.placement_id}</p>
                                )}
                            </div>

                            {/* Old Date & Proposed New Date */}
                            {selectedPlacement && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Tanggal Berakhir Saat Ini:</span>
                                        <span className="font-semibold text-slate-900">{formatDate(selectedPlacement.end_date)}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Perpanjangan (Requested Start Date) *</label>
                                <input
                                    type="date"
                                    min={selectedPlacement?.end_date ? String(selectedPlacement.end_date).substring(0, 10) : undefined}
                                    value={createForm.data.requested_start_date}
                                    onChange={(e) => createForm.setData('requested_start_date', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {createForm.errors.requested_start_date && (
                                    <p className="text-rose-500 text-[11px] mt-1">{createForm.errors.requested_start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai Perpanjangan (Requested End Date) *</label>
                                <input
                                    type="date"
                                    min={createForm.data.requested_start_date || undefined}
                                    value={createForm.data.requested_end_date}
                                    onChange={(e) => createForm.setData('requested_end_date', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {createForm.errors.requested_end_date && (
                                    <p className="text-rose-500 text-[11px] mt-1">{createForm.errors.requested_end_date}</p>
                                )}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Alasan Perpanjangan *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Jelaskan kebutuhan perpanjangan (misal: penyelesaian project industri, permintaan perusahaan, dsb)..."
                                    value={createForm.data.reason}
                                    onChange={(e) => createForm.setData('reason', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {createForm.errors.reason && (
                                    <p className="text-rose-500 text-[11px] mt-1">{createForm.errors.reason}</p>
                                )}
                            </div>

                            {/* Upload Surat Perpanjangan */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Surat Perpanjangan (PDF / DOC / DOCX) *</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    required
                                    onChange={(e) => createForm.setData('extension_letter', e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-3 py-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Format: PDF, DOC, DOCX (Maks 10MB)</p>
                                {createForm.errors.extension_letter && (
                                    <p className="text-rose-500 text-[11px] mt-1">{createForm.errors.extension_letter}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Mengirim...' : 'Submit Pengajuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: REVIEW EXTENSION (ADMIN) */}
            {reviewingExtension && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Review Perpanjangan PKL</h2>
                            <button
                                onClick={() => setReviewingExtension(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Siswa:</span>
                                    <span className="font-semibold text-slate-900">{reviewingExtension.student?.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Perusahaan:</span>
                                    <span className="font-semibold text-slate-900">{reviewingExtension.placement?.company?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Durasi Baru:</span>
                                    <span className="font-semibold text-emerald-600">
                                        {formatDate(reviewingExtension.old_end_date)} → {formatDate(reviewingExtension.requested_end_date)} (+{extendedDays(reviewingExtension)} hari)
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Pengaju:</span>
                                    <span className="font-semibold text-slate-900">{reviewingExtension.requester?.name} ({reviewingExtension.requester?.role})</span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Alasan Pengajuan:</label>
                                <p className="p-3 bg-amber-50/60 text-amber-900 rounded-xl border border-amber-200/60">
                                    {reviewingExtension.reason}
                                </p>
                            </div>

                            {canDownloadFile(reviewingExtension) && (
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Surat Perpanjangan:</label>
                                    <a
                                        href={`/perpanjangan/${reviewingExtension.id}/file`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh / Lihat Surat Perpanjangan
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Catatan Feedback Hubin (Optional / Wajib jika Reject):</label>
                                <textarea
                                    rows={3}
                                    placeholder="Berikan catatan atau instruksi tambahan..."
                                    value={reviewForm.data.review_feedback}
                                    onChange={(e) => reviewForm.setData('review_feedback', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {reviewForm.errors.review_feedback && (
                                    <p className="text-rose-500 text-[11px] mt-1">{reviewForm.errors.review_feedback}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => handleReviewSubmit('reject')}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
                                >
                                    Tolak Request
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReviewSubmit('approve')}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Setujui & Perbarui PKL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: DETAIL VIEW */}
            {detailExtension && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Detail Perpanjangan PKL</h2>
                            <button
                                onClick={() => setDetailExtension(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Status Permohonan:</span>
                                {getStatusBadge(detailExtension.status)}
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Siswa:</span>
                                    <span className="font-semibold text-slate-900">{detailExtension.student?.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Perusahaan:</span>
                                    <span className="font-semibold text-slate-900">{detailExtension.placement?.company?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tanggal Berakhir Lama:</span>
                                    <span className="font-semibold text-slate-700">{formatDate(detailExtension.old_end_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tanggal Mulai Perpanjangan:</span>
                                    <span className="font-semibold text-slate-700">{formatDate(detailExtension.requested_start_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tanggal Berakhir Baru:</span>
                                    <span className="font-semibold text-emerald-600">{formatDate(detailExtension.requested_end_date)} (+{extendedDays(detailExtension)} hari)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Diajukan Oleh:</span>
                                    <span className="font-semibold text-slate-900">{detailExtension.requester?.name} ({detailExtension.requester?.role})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Waktu Pengajuan:</span>
                                    <span className="font-medium text-slate-700">{formatDate(detailExtension.created_at)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Alasan Perpanjangan:</label>
                                <p className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200">
                                    {detailExtension.reason}
                                </p>
                            </div>

                            {detailExtension.review_feedback && (
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Catatan / Feedback Admin:</label>
                                    <p className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                                        {detailExtension.review_feedback}
                                    </p>
                                </div>
                            )}

                            {canDownloadFile(detailExtension) && (
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Surat Perpanjangan:</label>
                                    <a
                                        href={`/perpanjangan/${detailExtension.id}/file`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh / Lihat Dokumen Surat
                                    </a>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setDetailExtension(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
