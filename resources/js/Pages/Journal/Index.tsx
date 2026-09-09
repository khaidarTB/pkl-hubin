import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { BookOpen, Plus, Send, CheckCircle2, Clock, AlertCircle, Edit3, Eye, X, Search, Calendar, Sparkles } from 'lucide-react';
import { Journal } from '@/Types';

interface Props {
    journals: Journal[];
}

export default function JournalIndex({ journals }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
    const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const createForm = useForm({
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        skill: '',
        obstacle: '',
        solution: '',
    });

    const editForm = useForm({
        date: '',
        activity: '',
        description: '',
        skill: '',
        obstacle: '',
        solution: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/jurnal', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (journal: Journal) => {
        setEditingJournal(journal);
        editForm.setData({
            date: journal.date,
            activity: journal.activity,
            description: journal.description,
            skill: journal.skill,
            obstacle: journal.obstacle || '',
            solution: journal.solution || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJournal) return;
        editForm.put(`/jurnal/${editingJournal.id}`, {
            onSuccess: () => {
                setEditingJournal(null);
            },
        });
    };

    const filteredJournals = journals.filter(j =>
        j.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.date.includes(searchTerm)
    );

    const revisionCount = journals.filter(j => j.status === 'Revision').length;

    return (
        <DashboardLayout>
            <Head title="E-Jurnal Kegiatan PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">E-Jurnal Kegiatan PKL Harian</h1>
                    <p className="text-xs text-slate-500 mt-1">Catat aktivitas pekerjaan, kompetensi skill, dan tindak lanjuti revisi jurnal dari pembimbing.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Jurnal Hari Ini</span>
                </button>
            </div>

            {/* Alert Jurnal Perlu Revisi */}
            {revisionCount > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-rose-900 text-xs sm:text-sm">Ada {revisionCount} Jurnal Membutuhkan Perbaikan</h4>
                            <p className="text-rose-700 text-xs mt-0.5">Silakan klik tombol "Perbaiki Jurnal" pada kartu yang bersangkutan untuk merevisi dan mengajukan ulang.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari aktivitas, kompetensi skill, tanggal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <span className="text-xs text-slate-500 font-semibold">{filteredJournals.length} Jurnal Tercatat</span>
            </div>

            {/* List Jurnal */}
            <div className="space-y-4">
                {filteredJournals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 text-sm">Belum Ada Jurnal Kegiatan</h4>
                        <p className="text-xs text-slate-400 mt-1">Mulai isi jurnal harian PKL Anda sekarang.</p>
                    </div>
                ) : (
                    filteredJournals.map((j) => (
                        <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-[11px] font-mono text-slate-400 font-bold">{j.date}</span>
                                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{j.activity}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={j.status} />
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <button
                                            onClick={() => setSelectedJournal(j)}
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                            title="Detail Jurnal"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Detail</span>
                                        </button>
                                        {j.status !== 'Approved' && (
                                            <button
                                                onClick={() => openEditModal(j)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                                                    j.status === 'Revision'
                                                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                }`}
                                                title="Edit Jurnal"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>{j.status === 'Revision' ? 'Perbaiki Jurnal' : 'Edit'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-3">{j.description}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[11px]">
                                <span className="px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 font-semibold border border-cyan-100">
                                    Skill: {j.skill}
                                </span>
                                {j.obstacle && (
                                    <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium border border-rose-100">
                                        Kendala: {j.obstacle}
                                    </span>
                                )}
                                {j.solution && (
                                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                                        Solusi: {j.solution}
                                    </span>
                                )}
                            </div>

                            {j.revision_note && (
                                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                                    <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-900">
                                        <AlertCircle className="w-4 h-4 text-rose-600" />
                                        <span>Catatan Revisi dari Pembimbing Industri:</span>
                                    </div>
                                    <p className="leading-relaxed pl-5">{j.revision_note}</p>
                                    <div className="mt-3 pl-5">
                                        <button
                                            onClick={() => openEditModal(j)}
                                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Buka Form Perbaikan</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* MODAL DETAIL JURNAL */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 font-semibold">{selectedJournal.date}</span>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedJournal.activity}</h3>
                            </div>
                            <button onClick={() => setSelectedJournal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-500">Status Approval:</span>
                                <StatusBadge status={selectedJournal.status} size="sm" />
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">Deskripsi Pekerjaan</span>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedJournal.description}</p>
                            </div>

                            <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                                <span className="font-bold text-cyan-800 text-[11px]">Skill & Kompetensi:</span>
                                <p className="text-cyan-900 font-medium mt-0.5">{selectedJournal.skill}</p>
                            </div>

                            {(selectedJournal.obstacle || selectedJournal.solution) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                        <span className="font-bold text-rose-800 text-[11px]">Kendala Teknis:</span>
                                        <p className="text-rose-950 mt-0.5">{selectedJournal.obstacle || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <span className="font-bold text-emerald-800 text-[11px]">Solusi:</span>
                                        <p className="text-emerald-950 mt-0.5">{selectedJournal.solution || '-'}</p>
                                    </div>
                                </div>
                            )}

                            {selectedJournal.revision_note && (
                                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                                    <span className="font-bold text-rose-800 text-[11px]">Catatan Revisi:</span>
                                    <p className="text-rose-900 mt-0.5">{selectedJournal.revision_note}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                            {selectedJournal.status !== 'Approved' ? (
                                <button
                                    onClick={() => {
                                        const j = selectedJournal;
                                        setSelectedJournal(null);
                                        openEditModal(j);
                                    }}
                                    className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1.5"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Jurnal Ini</span>
                                </button>
                            ) : <div />}
                            <button onClick={() => setSelectedJournal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL FORM TAMBAH JURNAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <h3 className="font-extrabold text-slate-900 text-lg">Form Input Jurnal PKL</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Tanggal Kegiatan</label>
                                <input
                                    type="date"
                                    required
                                    value={createForm.data.date}
                                    onChange={(e) => createForm.setData('date', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Judul Aktivitas Pekerjaan</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Troubleshooting motherboard dan instalasi OS Windows 11"
                                    value={createForm.data.activity}
                                    onChange={(e) => createForm.setData('activity', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                {createForm.errors.activity && <p className="text-rose-500 mt-1">{createForm.errors.activity}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Pekerjaan Rinci</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Jelaskan langkah pekerjaan yang Anda lakukan secara detail..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Skill / Kompetensi Yang Dipelajari</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Hardware maintenance, BIOS configuration"
                                    value={createForm.data.skill}
                                    onChange={(e) => createForm.setData('skill', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Kendala Teknis (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="Kendala yang dihadapi..."
                                        value={createForm.data.obstacle}
                                        onChange={(e) => createForm.setData('obstacle', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Solusi / Penanganan (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="Solusi penyelesaian..."
                                        value={createForm.data.solution}
                                        onChange={(e) => createForm.setData('solution', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Jurnal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT / REVISI JURNAL */}
            {editingJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">
                                    {editingJournal.status === 'Revision' ? 'Perbaiki & Ajukan Ulang Jurnal' : 'Edit Jurnal PKL'}
                                </h3>
                                <p className="text-xs text-slate-500">Perbarui data kegiatan sebelum disetujui pembimbing.</p>
                            </div>
                            <button onClick={() => setEditingJournal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {editingJournal.revision_note && (
                            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                                <span className="font-bold block text-rose-900 mb-1">Catatan Koreksi dari Pembimbing:</span>
                                <p className="leading-relaxed">{editingJournal.revision_note}</p>
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Tanggal Kegiatan</label>
                                <input
                                    type="date"
                                    required
                                    value={editForm.data.date}
                                    onChange={(e) => editForm.setData('date', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Judul Aktivitas Pekerjaan</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.activity}
                                    onChange={(e) => editForm.setData('activity', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                {editForm.errors.activity && <p className="text-rose-500 mt-1">{editForm.errors.activity}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Pekerjaan Rinci</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Skill / Kompetensi Yang Dipelajari</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.skill}
                                    onChange={(e) => editForm.setData('skill', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Kendala Teknis (Opsional)</label>
                                    <input
                                        type="text"
                                        value={editForm.data.obstacle}
                                        onChange={(e) => editForm.setData('obstacle', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Solusi / Penanganan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={editForm.data.solution}
                                        onChange={(e) => editForm.setData('solution', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingJournal(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{editForm.processing ? 'Menyimpan...' : 'Simpan & Ajukan Ulang'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
