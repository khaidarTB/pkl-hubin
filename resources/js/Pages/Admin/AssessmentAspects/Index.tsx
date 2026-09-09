import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { AssessmentAspect } from '@/Types';
import { ListChecks, Plus, Edit3, Trash2, X, Check, Search, Target, Gauge } from 'lucide-react';

interface Props { aspects: AssessmentAspect[]; }

interface AspectForm {
    name: string;
    description: string;
    max_score: number;
    min_score: number;
    sort_order: number;
    is_active: boolean;
}

export default function AssessmentAspectsIndex({ aspects }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAspect, setEditingAspect] = useState<AssessmentAspect | null>(null);
    const [deletingAspect, setDeletingAspect] = useState<AssessmentAspect | null>(null);

    const addForm = useForm<AspectForm>({
        name: '', description: '', max_score: 100, min_score: 85, sort_order: aspects.length + 1, is_active: true,
    });

    const editForm = useForm<AspectForm>({
        name: '', description: '', max_score: 100, min_score: 85, sort_order: 1, is_active: true,
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/aspek-nilai', {
            onSuccess: () => { setIsAddModalOpen(false); addForm.reset(); },
        });
    };

    const openEditModal = (a: AssessmentAspect) => {
        setEditingAspect(a);
        editForm.setData({
            name: a.name,
            description: a.description || '',
            max_score: a.max_score,
            min_score: a.min_score,
            sort_order: a.sort_order,
            is_active: a.is_active,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAspect) return;
        editForm.put(`/admin/aspek-nilai/${editingAspect.id}`, { onSuccess: () => setEditingAspect(null) });
    };

    const handleDelete = () => {
        if (!deletingAspect) return;
        router.delete(`/admin/aspek-nilai/${deletingAspect.id}`, { onSuccess: () => setDeletingAspect(null) });
    };

    const filtered = aspects.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = aspects.filter(a => a.is_active).length;

    return (
        <DashboardLayout>
            <Head title="Konfigurasi Aspek Nilai" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Konfigurasi Aspek Nilai</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">
                            Kelola aspek kompetensi yang dinilai beserta nilai minimum Ketuntasan (KKM) per aspek.
                        </p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start shadow-sm">
                        <Plus className="w-4 h-4 text-emerald-400" /> Tambah Aspek
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ListChecks className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-semibold">Total Aspek</p>
                            <h4 className="text-lg font-bold text-slate-900">{aspects.length}</h4>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-semibold">Aspek Aktif</p>
                            <h4 className="text-lg font-bold text-slate-900">{activeCount}</h4>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center shrink-0"><Target className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-amber-700/70 font-semibold">Nilai Minimum Aktif (KKM)</p>
                            <h4 className="text-lg font-bold text-slate-900">
                                {aspects.filter(a => a.is_active).map(a => a.min_score).join(' · ') || '-'}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari nama aspek..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{filtered.length} Aspek</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                        <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-semibold text-slate-600 text-sm">Tidak ada aspek yang sesuai.</p>
                        <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Tambah Aspek" untuk membuat aspek penilaian baru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((a) => (
                            <div key={a.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-shadow flex flex-col justify-between ${a.is_active ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-200/60 opacity-70'}`}>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-[15px] font-bold text-slate-900">{a.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {a.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 line-clamp-2">{a.description || 'Tanpa deskripsi.'}</p>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Skor Maks</p>
                                            <p className="text-sm font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                                                <Gauge className="w-3.5 h-3.5 text-slate-400" /> {a.max_score}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50/70 p-2.5 text-center border border-emerald-100">
                                            <p className="text-[10px] font-bold text-emerald-600/80 uppercase">Min (KKM)</p>
                                            <p className="text-sm font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                                                <Target className="w-3.5 h-3.5" /> {a.min_score}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Urutan #{a.sort_order}</span>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(a)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingAspect(a)}
                                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                                            title={a.is_active ? 'Nonaktifkan / Hapus Aspek' : 'Aktifkan Kembali / Hapus'}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= MODAL TAMBAH ASPEK ================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Aspek Penilaian</h3>
                                <p className="text-[12px] text-slate-500">Aspek baru otomatis masuk ke form penilaian guru & industri.</p>
                            </div>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Aspek</label>
                            <input type="text" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} required
                                placeholder="cth: Inovasi & Digitalisasi"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            {addForm.errors.name && <p className="text-[11px] text-rose-500 mt-1">{addForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Deskripsi</label>
                            <textarea value={addForm.data.description} onChange={(e) => addForm.setData('description', e.target.value)} rows={2}
                                placeholder="Penjelasan singkat kriteria penilaian aspek ini..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Skor Maksimum</label>
                                <input type="number" min={1} max={1000}
                                    value={addForm.data.max_score}
                                    onChange={(e) => {
                                        const max = parseInt(e.target.value) || 100;
                                        addForm.setData(d => ({ ...d, max_score: max, min_score: d.min_score > max ? max : d.min_score }));
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nilai Minimum (KKM)</label>
                                <input type="number" min={0} max={addForm.data.max_score}
                                    value={addForm.data.min_score}
                                    onChange={(e) => addForm.setData('min_score', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                {addForm.errors.min_score && <p className="text-[11px] text-rose-500 mt-1">{addForm.errors.min_score}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                                <input type="number" min={0}
                                    value={addForm.data.sort_order}
                                    onChange={(e) => addForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 pb-2 cursor-pointer">
                                <input type="checkbox" checked={addForm.data.is_active}
                                    onChange={(e) => addForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 focus:ring-emerald-500" />
                                Aktif langsung
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={addForm.processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan Aspek</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL EDIT ASPEK ================= */}
            {editingAspect && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Edit Aspek</span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingAspect.name}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingAspect(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Aspek</label>
                            <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            {editForm.errors.name && <p className="text-[11px] text-rose-500 mt-1">{editForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Deskripsi</label>
                            <textarea value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} rows={2}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Skor Maksimum</label>
                                <input type="number" min={1} max={1000}
                                    value={editForm.data.max_score}
                                    onChange={(e) => {
                                        const max = parseInt(e.target.value) || 100;
                                        editForm.setData(d => ({ ...d, max_score: max, min_score: d.min_score > max ? max : d.min_score }));
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nilai Minimum (KKM)</label>
                                <input type="number" min={0} max={editForm.data.max_score}
                                    value={editForm.data.min_score}
                                    onChange={(e) => editForm.setData('min_score', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                {editForm.errors.min_score && <p className="text-[11px] text-rose-500 mt-1">{editForm.errors.min_score}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                                <input type="number" min={0}
                                    value={editForm.data.sort_order}
                                    onChange={(e) => editForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 pb-2 cursor-pointer">
                                <input type="checkbox" checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 focus:ring-emerald-500" />
                                Aspek aktif
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditingAspect(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL NONAKTIFKAN / HAPUS ================= */}
            {deletingAspect && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-base">
                                {deletingAspect.is_active
                                    ? (deletingAspect.scores_count ? 'Nonaktifkan Aspek?' : 'Hapus Aspek?')
                                    : 'Aktifkan Kembali?'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {deletingAspect.is_active
                                    ? deletingAspect.scores_count
                                        ? <>Aspek <strong className="text-slate-800">{deletingAspect.name}</strong> sudah dipakai {deletingAspect.scores_count}x penilaian, jadi aspek akan <strong>dinonaktifkan</strong> agar tidak dipakai pada penilaian baru.</>
                                        : <>Aspek <strong className="text-slate-800">{deletingAspect.name}</strong> belum pernah dipakai dan akan <strong>dihapus permanen</strong>.</>
                                    : <>Aspek <strong className="text-slate-800">{deletingAspect.name}</strong> akan diaktifkan kembali di form penilaian.</>}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 pt-2">
                            <button onClick={() => setDeletingAspect(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">Batal</button>
                            <button onClick={handleDelete}
                                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md ${
                                    deletingAspect.is_active
                                        ? (deletingAspect.scores_count ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700')
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}>
                                {deletingAspect.is_active
                                    ? (deletingAspect.scores_count ? 'Ya, Nonaktifkan' : 'Ya, Hapus')
                                    : 'Ya, Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}