import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Document as DocumentType, DocumentTemplate } from '@/Types';
import { FileText, QrCode, CheckCircle2, XCircle, AlertTriangle, Clock, Eye, Plus, FilePlus } from 'lucide-react';

interface Props { documents: DocumentType[]; templates: DocumentTemplate[]; }

const VERIFICATION_STATUS_META = {
    VALID: { icon: CheckCircle2, label: 'Valid', cls: 'bg-emerald-50 text-emerald-700' },
    REVOKED: { icon: XCircle, label: 'Revoked', cls: 'bg-rose-50 text-rose-700' },
    EXPIRED: { icon: AlertTriangle, label: 'Expired', cls: 'bg-amber-50 text-amber-700' },
} as const;

export default function DocumentIndex({ documents, templates }: Props) {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
    const templateForm = useForm({ name: '', description: '', type: 'surat_tugas' });
    const createDocForm = useForm({
        title: 'Surat Tugas Kunjungan', document_type: 'surat_tugas',
        nama_guru: 'Dra. Endang Rahayu, M.T.', nip: '19750812 200212 2 001',
        nama_siswa: 'Rizky Ramadhan', nis: '222310452', kelas: 'XII RPL 1',
        nama_industri: 'PT Digital Nusantara', alamat_industri: 'Jl. Sudirman No. 45',
        tanggal_kunjungan: new Date().toISOString().split('T')[0],
    });
    const handleTemplateSubmit = (e: React.FormEvent) => { e.preventDefault(); templateForm.post('/admin/template-dokumen', { onSuccess: () => { setIsTemplateModalOpen(false); templateForm.reset(); } }); };
    const handleCreateDocSubmit = (e: React.FormEvent) => { e.preventDefault(); createDocForm.post('/dokumen', { onSuccess: () => setIsCreateDocModalOpen(false) }); };

    return (
        <DashboardLayout>
            <Head title="Surat & Dokumen" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Surat & Dokumen</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Generate surat berbasis template dengan QR verification.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsCreateDocModalOpen(true)}
                            className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-1.5">
                            <FilePlus className="w-4 h-4" /> Buat Surat
                        </button>
                        <button onClick={() => setIsTemplateModalOpen(true)}
                            className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold text-[12px] rounded-xl hover:bg-slate-200 flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Template
                        </button>
                    </div>
                </div>

                {/* Templates */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                    <h3 className="text-[13px] font-bold text-slate-900">Template Surat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {templates.map((tpl) => (
                            <div key={tpl.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><FileText className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[12px] font-bold text-slate-900">{tpl.name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{tpl.description || 'Template resmi'}</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {tpl.placeholders?.slice(0, 3).map((p, idx) => (
                                            <span key={idx} className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-mono">{'{'}{p}{'}'}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-[13px] font-bold text-slate-900">Arsip Surat Tergenerasi</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3">Nomor</th>
                                    <th className="px-5 py-3">Judul</th>
                                    <th className="px-5 py-3">Verification ID</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.map((doc) => {
                                    const v = doc.verification;
                                    const status = v?.status;
                                    const meta = status && status in VERIFICATION_STATUS_META ? VERIFICATION_STATUS_META[status as keyof typeof VERIFICATION_STATUS_META] : null;
                                    const StatusIcon = meta?.icon;
                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3 font-mono font-semibold text-emerald-600">{doc.document_number || '-'}</td>
                                            <td className="px-5 py-3 font-medium text-slate-900 max-w-[200px] truncate">{doc.title}</td>
                                            <td className="px-5 py-3 font-mono text-[11px] text-slate-600">{v?.verification_code || '-'}</td>
                                            <td className="px-5 py-3">
                                                {meta && StatusIcon ? (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${meta.cls}`}>
                                                        <StatusIcon className="w-3 h-3" /> {meta.label}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link href={`/dokumen/${doc.id}`}
                                                    className="px-3 py-1.5 bg-slate-900 text-white font-semibold text-[11px] rounded-lg hover:bg-slate-800 inline-flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Preview
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isCreateDocModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateDocSubmit} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Buat Surat Tugas Baru</h3>
                            <p className="text-[12px] text-slate-500">Generate surat dari template otomatis.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                            <div><label className="block font-semibold text-slate-700 mb-1">Nama Guru</label><input type="text" value={createDocForm.data.nama_guru} onChange={(e) => createDocForm.setData('nama_guru', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required /></div>
                            <div><label className="block font-semibold text-slate-700 mb-1">NIP</label><input type="text" value={createDocForm.data.nip} onChange={(e) => createDocForm.setData('nip', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                            <div><label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label><input type="text" value={createDocForm.data.nama_siswa} onChange={(e) => createDocForm.setData('nama_siswa', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required /></div>
                            <div><label className="block font-semibold text-slate-700 mb-1">NIS / Kelas</label><input type="text" value={createDocForm.data.nis} onChange={(e) => createDocForm.setData('nis', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                            <div className="sm:col-span-2"><label className="block font-semibold text-slate-700 mb-1">Perusahaan</label><input type="text" value={createDocForm.data.nama_industri} onChange={(e) => createDocForm.setData('nama_industri', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required /></div>
                            <div className="sm:col-span-2"><label className="block font-semibold text-slate-700 mb-1">Tanggal</label><input type="date" value={createDocForm.data.tanggal_kunjungan} onChange={(e) => createDocForm.setData('tanggal_kunjungan', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required /></div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsCreateDocModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={createDocForm.processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Generate</button>
                        </div>
                    </form>
                </div>
            )}

            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleTemplateSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Template Surat Baru</h3>
                        </div>
                        <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Template</label><input type="text" value={templateForm.data.name} onChange={(e) => templateForm.setData('name', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                        <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Deskripsi</label><textarea value={templateForm.data.description} onChange={(e) => templateForm.setData('description', e.target.value)} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={templateForm.processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan</button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
