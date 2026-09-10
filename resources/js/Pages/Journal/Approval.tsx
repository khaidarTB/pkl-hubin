import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { CheckCircle2, AlertCircle, PenLine, UploadCloud, ImageIcon, FileUp } from 'lucide-react';

interface Props {
    journals: any[];
}

function approverRoleLabel(role?: string) {
    if (role === 'guru') return 'Pembimbing Sekolah / Walikelas';
    if (role === 'industri') return 'Pembimbing Industri';
    return role || 'Pembimbing';
}

export default function JournalApproval({ journals }: Props) {
    const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveJournal, setApproveJournal] = useState<any | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string>('');
    const [signError, setSignError] = useState<string>('');
    const [approving, setApproving] = useState(false);

    const openApproveModal = (j: any) => {
        setApproveJournal(j);
        setSignatureFile(null);
        setSignaturePreview('');
        setSignError('');
        setShowApproveModal(true);
    };

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSignatureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setSignaturePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setSignaturePreview('');
        }
    };

    const handleApproveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!approveJournal) return;
        if (!signatureFile && !approveJournal.signature_ready) return;

        setApproving(true);
        setSignError('');

        const formData = new FormData();
        if (signatureFile) formData.append('signature', signatureFile);
        // PHP hanya membaca $_FILES pada request POST, jadi gunakan POST
        // dan biarkan Laravel meneruskan ke route PUT lewat field _method.
        formData.append('_method', 'put');

        router.post(`/jurnal/${approveJournal.id}/approve`, formData, {
            onSuccess: () => {
                setShowApproveModal(false);
                setApproveJournal(null);
                setSignatureFile(null);
                setSignaturePreview('');
                setSignError('');
            },
            onError: (errors) => {
                setSignError(errors?.signature || 'Terjadi kesalahan saat mengirim. Coba lagi.');
                setApproving(false);
            },
        });
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
            <Head title="Approval Jurnal PKL" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Persetujuan E-Jurnal PKL</h1>
                <p className="text-xs text-slate-500 mt-1">Review, berikan persetujuan dengan tanda tangan, atau catatan revisi untuk jurnal harian siswa bimbingan Anda.</p>
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
                                                onClick={() => openApproveModal(j)}
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

                            {j.status === 'Approved' && j.approver && (
                                <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-xs text-emerald-900">
                                        <strong>Disetujui oleh:</strong> {j.approver.name}
                                        <span className="text-emerald-700 ml-2 font-medium">({approverRoleLabel(j.approver.role)})</span>
                                        {j.approved_at && (
                                            <span className="text-emerald-600 block mt-0.5">
                                                {new Date(j.approved_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                    {j.approved_signature_url && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase text-emerald-700">Tanda Tangan</span>
                                            <img
                                                src={j.approved_signature_url}
                                                alt="Tanda tangan approver"
                                                className="h-12 w-auto bg-white rounded-lg border border-emerald-200 p-1 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Approve dengan Upload Tanda Tangan */}
            {showApproveModal && approveJournal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <PenLine className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">Setujui & Tanda Tangan</h3>
                                <p className="text-xs text-slate-500">Upload file gambar tanda tangan untuk <strong>{approveJournal.student?.user?.name}</strong>.</p>
                            </div>
                        </div>

                        <form onSubmit={handleApproveSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gambar Tanda Tangan</label>
                                <input
                                    id="signature-file"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    required={!approveJournal.signature_ready}
                                    onChange={handleSignatureChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="signature-file"
                                    className="flex flex-col items-center justify-center gap-2 w-full p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                                >
                                    {signaturePreview ? (
                                        <img src={signaturePreview} alt="Pratinjau tanda tangan" className="h-24 w-auto object-contain bg-white rounded-lg p-2 border border-emerald-200" />
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-700">Klik untuk memilih gambar tanda tangan (PNG / JPG)</span>
                                        </>
                                    )}
                                </label>
                                {signatureFile && (
                                    <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                                        <FileUp className="w-3.5 h-3.5" /> {signatureFile.name}
                                    </p>
                                )}
                                {approveJournal.signature_ready && (
                                    <p className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                                        Tanda tangan Anda sudah tersimpan dan akan dipakai otomatis di jurnal ini. Upload ulang hanya jika ingin menggantinya.
                                    </p>
                                )}
                                {signError && (
                                    <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
                                        {signError}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setApproveJournal(null);
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={approving || (!signatureFile && !approveJournal.signature_ready)}
                                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {approving ? 'Menyetujui...' : 'Setujui & Tandatangani'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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