import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Calendar, Plus, Edit3, Trash2, Eye, Search, AlertCircle, CheckCircle2, X, Clock } from 'lucide-react';

interface Period {
    id: number;
    name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'active' | 'completed';
    placements_count: number;
    applications_count: number;
}

interface Props {
    periods: Period[];
}

export default function PeriodsIndex({ periods }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
    const [deletingPeriod, setDeletingPeriod] = useState<Period | null>(null);

    const createForm = useForm({
        name: '',
        academic_year: '2026/2027',
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });

    const editForm = useForm({
        name: '',
        academic_year: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/periode', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (period: Period) => {
        setEditingPeriod(period);
        editForm.setData({
            name: period.name,
            academic_year: period.academic_year,
            start_date: period.start_date ? period.start_date.substring(0, 10) : '',
            end_date: period.end_date ? period.end_date.substring(0, 10) : '',
            status: period.status,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPeriod) return;
        editForm.put(`/admin/periode/${editingPeriod.id}`, {
            onSuccess: () => {
                setEditingPeriod(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingPeriod) return;
        router.delete(`/admin/periode/${deletingPeriod.id}`, {
            onSuccess: () => setDeletingPeriod(null),
        });
    };

    const filteredPeriods = periods.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.academic_year.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activePeriod = periods.find((p) => p.status === 'active');

    return (
        <DashboardLayout>
            <Head title="Manajemen Periode PKL" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Periode PKL</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Kelola gelombang dan kalender pelaksanaan Praktik Kerja Lapangan.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Periode Baru</span>
                </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Periode Aktif Saat Ini</p>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5 truncate max-w-[200px]">
                            {activePeriod ? activePeriod.name : 'Tidak Ada Aktif'}
                        </h4>
                        <p className="text-[11px] text-emerald-600 font-semibold">{activePeriod?.academic_year || '-'}</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Total Periode Terdaftar</p>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">{periods.length} Gelombang</h4>
                        <p className="text-[11px] text-slate-500">Seluruh tahun ajaran</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Total Penempatan Aktif</p>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                            {periods.reduce((acc, curr) => acc + (curr.placements_count || 0), 0)} Siswa
                        </h4>
                        <p className="text-[11px] text-slate-500">Tergabung di periode</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama periode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-56"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Sedang Berjalan (Active)</option>
                            <option value="upcoming">Mendatang (Upcoming)</option>
                            <option value="completed">Selesai (Completed)</option>
                        </select>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{filteredPeriods.length} Periode</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Nama Periode</th>
                                <th className="p-4">Tahun Ajaran</th>
                                <th className="p-4">Rentang Waktu PKL</th>
                                <th className="p-4 text-center">Pendaftaran</th>
                                <th className="p-4 text-center">Penempatan</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Aksi Table</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredPeriods.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400">
                                        Tidak ada data periode yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredPeriods.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{p.name}</td>
                                        <td className="p-4">{p.academic_year}</td>
                                        <td className="p-4">
                                            <span className="text-slate-800 font-semibold">{p.start_date ? p.start_date.substring(0, 10) : '-'}</span>
                                            <span className="text-slate-400 mx-1.5">s/d</span>
                                            <span className="text-slate-800 font-semibold">{p.end_date ? p.end_date.substring(0, 10) : '-'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg">
                                                {p.applications_count || 0} Pengajuan
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                                                {p.placements_count || 0} Siswa
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {p.status === 'active' && (
                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                                                    Aktif
                                                </span>
                                            )}
                                            {p.status === 'upcoming' && (
                                                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">
                                                    Mendatang
                                                </span>
                                            )}
                                            {p.status === 'completed' && (
                                                <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-full">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* DETAIL BUTTON */}
                                                <button
                                                    onClick={() => setSelectedPeriod(p)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Lihat Detail Periode"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Detail</span>
                                                </button>
                                                {/* EDIT BUTTON */}
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Edit Periode"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                {/* DELETE BUTTON */}
                                                <button
                                                    onClick={() => setDeletingPeriod(p)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                    title="Hapus Periode"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Hapus</span>
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

            {/* MODAL TAMBAH PERIODE */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Periode PKL</h3>
                                <p className="text-xs text-slate-500">Tentukan nama dan durasi pelaksanaan PKL</p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Periode</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Gelombang 1 Ganjil 2026/2027"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: 2026/2027"
                                    value={createForm.data.academic_year}
                                    onChange={(e) => createForm.setData('academic_year', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.end_date}
                                        onChange={(e) => createForm.setData('end_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Status Periode</label>
                                <select
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value as any)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50 font-medium"
                                >
                                    <option value="upcoming">Mendatang (Upcoming)</option>
                                    <option value="active">Aktif (Sedang Berjalan)</option>
                                    <option value="completed">Selesai (Completed)</option>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    *Jika memilih Aktif, periode aktif sebelumnya akan otomatis diubah menjadi Selesai.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Periode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT PERIODE */}
            {editingPeriod && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Edit Periode PKL</h3>
                                <p className="text-xs text-slate-500">{editingPeriod.name}</p>
                            </div>
                            <button onClick={() => setEditingPeriod(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Periode</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.academic_year}
                                    onChange={(e) => editForm.setData('academic_year', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.start_date}
                                        onChange={(e) => editForm.setData('start_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.end_date}
                                        onChange={(e) => editForm.setData('end_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Status Periode</label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value as any)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none p-2.5 bg-slate-50 font-medium"
                                >
                                    <option value="upcoming">Mendatang (Upcoming)</option>
                                    <option value="active">Aktif (Sedang Berjalan)</option>
                                    <option value="completed">Selesai (Completed)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingPeriod(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Periode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL PERIODE */}
            {selectedPeriod && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Detail Gelombang PKL
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedPeriod.name}</h3>
                            </div>
                            <button onClick={() => setSelectedPeriod(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tahun Ajaran:</span>
                                    <span className="font-semibold text-slate-800">{selectedPeriod.academic_year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Mulai:</span>
                                    <span className="font-semibold text-slate-800">{selectedPeriod.start_date ? selectedPeriod.start_date.substring(0, 10) : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Selesai:</span>
                                    <span className="font-semibold text-slate-800">{selectedPeriod.end_date ? selectedPeriod.end_date.substring(0, 10) : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Operasional:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        selectedPeriod.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                        selectedPeriod.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {selectedPeriod.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <span className="text-blue-700 font-semibold text-[11px]">Total Pengajuan</span>
                                    <p className="text-xl font-bold text-blue-800 mt-0.5">{selectedPeriod.applications_count || 0}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-emerald-700 font-semibold text-[11px]">Total Penempatan</span>
                                    <p className="text-xl font-bold text-emerald-800 mt-0.5">{selectedPeriod.placements_count || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                            <button
                                onClick={() => {
                                    const p = selectedPeriod;
                                    setSelectedPeriod(null);
                                    openEditModal(p);
                                }}
                                className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Periode</span>
                            </button>
                            <button onClick={() => setSelectedPeriod(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS PERIODE */}
            {deletingPeriod && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Periode PKL?</h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-800">"{deletingPeriod.name}"</span>?
                            {deletingPeriod.placements_count > 0 && (
                                <span className="block text-rose-600 font-semibold mt-1">
                                    Peringatan: Periode ini memiliki {deletingPeriod.placements_count} data penempatan aktif.
                                </span>
                            )}
                        </p>

                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setDeletingPeriod(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                            >
                                Ya, Hapus Periode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
