import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { BookOpen, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface Props {
    journals: any[];
}

export default function JournalApproval({ journals }: Props) {
    const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleApprove = (id: number) => {
        if (confirm('Setujui jurnal harian siswa ini?')) {
            router.put(`/jurnal/${id}/approve`);
        }
    };

    const handleRevisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJournal || !revisionNote) return;

        router.put(`/jurnal/${selectedJournal.id}/revision`, {
            revision_note: revisionNote,
        }, {
            onSuccess: () => {
                setShowModal(false);
                setRevisionNote('');
                setSelectedJournal(null);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Approval Jurnal Pembimbing Industri" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Persetujuan E-Jurnal PKL (Industri)</h1>
                <p className="text-xs text-slate-500 mt-1">Review dan berikan persetujuan atau catatan revisi jurnal harian siswa bimbingan Anda.</p>
            </div>

            {/* List Jurnal Pengajuan */}
            <div className="space-y-4">
                {journals.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400">
                        Belum ada jurnal kegiatan yang diajukan siswa.
                    </div>
                ) : (
                    journals.map((j) => (
                        <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-xs font-bold text-cyan-600 uppercase">{j.student?.user?.name || 'Siswa'}</span>
                                    <span className="text-[11px] font-mono text-slate-400 font-bold ml-2">({j.date})</span>
                                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{j.activity}</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={j.status} />
                                    {j.status === 'Menunggu Approval' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(j.id)}
                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Setujui</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedJournal(j);
                                                    setShowModal(true);
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Minta Revisi</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 mt-4 leading-relaxed">{j.description}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
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
                                <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                                    <strong>Catatan Revisi Ditulis:</strong> {j.revision_note}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Revisi Jurnal */}
            {showModal && selectedJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Minta Revisi Jurnal Siswa</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Berikan masukan atau arahan perbaikan jurnal untuk <strong>{selectedJournal.student?.user?.name}</strong>.
                        </p>

                        <form onSubmit={handleRevisionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catatan Revisi</label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Contoh: Tolong uraikan lebih rinci bagian penanganan solusi kendala teknis..."
                                    value={revisionNote}
                                    onChange={(e) => setRevisionNote(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedJournal(null);
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700"
                                >
                                    Kirim Revisi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
