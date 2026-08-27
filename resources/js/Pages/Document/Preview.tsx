import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Document as DocumentType } from '@/Types';
import {
    FileText, ShieldCheck, ArrowLeft, Printer,
    CheckCircle2, XCircle, AlertTriangle, QrCode
} from 'lucide-react';

interface Props {
    document: DocumentType;
    verification_url: string;
    qr_payload?: string;
}

export default function DocumentPreview({ document, verification_url, qr_payload }: Props) {
    const docData = document.data || {};
    const verification = document.verification;
    const status = verification?.status ?? 'VALID';
    const qrValue = qr_payload || verification_url;

    const statusMeta = {
        VALID: { icon: CheckCircle2, label: '🟢 Valid', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        REVOKED: { icon: XCircle, label: '🔴 Revoked', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
        EXPIRED: { icon: AlertTriangle, label: '🟡 Expired', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    }[status] || { icon: ShieldCheck, label: status, cls: 'bg-slate-800 text-slate-300 border-slate-700' };

    const StatusIcon = statusMeta.icon;

    return (
        <DashboardLayout>
            <Head title={`Preview ${document.title}`} />

            {/* Print-only stylesheet: cetak hanya lembar resmi surat */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #official-letter, #official-letter * { visibility: visible !important; }
                    #official-letter {
                        position: absolute !important; inset: 0 auto auto 0;
                        width: 100% !important; max-width: none !important;
                        box-shadow: none !important; border-radius: 0 !important;
                    }
                }
            `}</style>

            <div className="space-y-6">
                {/* Header controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link
                        href="/dokumen"
                        className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali Ke Daftar Dokumen
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        {verification && (
                            <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase inline-flex items-center gap-1.5 border ${statusMeta.cls}`}>
                                <StatusIcon className="w-3.5 h-3.5" /> Document Status: {statusMeta.label}
                            </span>
                        )}
                        <button
                            onClick={() => window.print()}
                            disabled={status === 'REVOKED'}
                            title={status === 'REVOKED' ? 'Dokumen dicabut — tidak dapat dicetak' : undefined}
                            className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-40"
                        >
                            <Printer className="w-4 h-4" /> Cetak / Download PDF
                        </button>
                    </div>
                </div>

                {/* Verification ID strip (tidak ikut tercetak, hanya info UI) */}
                {verification && (
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] print:hidden">
                        <span className="text-slate-500">Verification ID:</span>
                        <span className="font-mono font-bold text-emerald-600">{verification.verification_code}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">Nomor Surat:</span>
                        <span className="font-mono font-semibold text-slate-900">{verification.document_number}</span>
                    </div>
                )}

                {/* Printable Official School Letter */}
                <div id="official-letter" className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 font-serif border border-slate-200">
                    {/* Header Kop Surat Resmi */}
                    <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1 font-sans">
                        <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide">Pemerintah Provinsi DKI Jakarta</h2>
                        <h3 className="text-lg sm:text-xl font-bold uppercase text-slate-800">Dinas Pendidikan SMK Negeri 1 Jakarta</h3>
                        <p className="text-xs text-slate-600 font-normal">Jl. Budi Utomo No. 7, Pasar Baru, Sawah Besar, Jakarta Pusat | Telp: (021) 3813630</p>
                                <p className="text-[11px] text-slate-500 font-medium">Website: smkn1jakarta.sch.id • Email: hubin@smkn1jakarta.sch.id</p>
                    </div>

                    {/* Document Title & Number */}
                    <div className="text-center space-y-1 font-sans">
                        <h1 className="text-lg font-black uppercase underline decoration-2 underline-offset-4">
                            {document.type === 'surat_jalan' ? 'Surat Jalan Kunjungan PKL' : 'Surat Tugas Kunjungan Monitoring PKL'}
                        </h1>
                        <p className="text-xs font-semibold text-slate-700">Nomor: {docData.nomor_surat || document.document_number}</p>
                    </div>

                    {/* Document Content (autofill template placeholders) */}
                    <div className="text-sm leading-relaxed space-y-4 font-sans text-slate-800">
                        <p>Yang bertanda tangan di bawah ini Kepala SMKN 1 Jakarta memberikan tugas resmi kepada:</p>

                        <div className="pl-6 space-y-1 text-xs sm:text-sm font-medium">
                            <p><strong className="w-36 inline-block text-slate-600">Nama Guru:</strong> {docData.nama_guru || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">NIP:</strong> {docData.nip || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">Jabatan:</strong> Guru Pembimbing PKL / Supervisor Monitoring</p>
                        </div>

                        <p>Untuk melaksanakan kegiatan Kunjungan Monitoring &amp; Evaluasi Praktik Kerja Lapangan (PKL) terhadap siswa berikut:</p>

                        <div className="pl-6 space-y-1 text-xs sm:text-sm font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p><strong className="w-36 inline-block text-slate-600">Nama Siswa:</strong> {docData.nama_siswa || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">NIS / Kelas:</strong> {docData.nis || '-'} ({docData.kelas || '-'})</p>
                            <p><strong className="w-36 inline-block text-slate-600">Perusahaan Tujuan:</strong> {docData.nama_industri || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">Alamat Perusahaan:</strong> {docData.alamat_industri || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">Tanggal Kunjungan:</strong> {docData.tanggal_kunjungan || '-'}</p>
                            <p><strong className="w-36 inline-block text-slate-600">Tujuan Kunjungan:</strong> {docData.tujuan_kunjungan || '-'}</p>
                        </div>

                        <p>Demikian Surat Tugas ini dibuat untuk dipergunakan sebagaimana mestinya dan pihak industri mohon dapat memberikan kerja sama yang baik.</p>
                    </div>

                    {/* Penutup surat + QR Verification di kolom tanda tangan */}
                    <div className="pt-4 flex justify-end font-sans">
                        <div className={`text-center w-64 space-y-1.5 ${status === 'REVOKED' ? 'opacity-60' : ''}`}>
                            <p className="text-xs text-slate-600">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="text-xs font-bold text-slate-800 pb-1">Kepala Program Keahlian PKL,</p>

                            {/* QR Code Document Verification — pas di kolom ttd */}
                            <div className="flex flex-col items-center py-1.5">
                                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <QRCodeSVG value={qrValue} size={108} level="M" />
                                </div>
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-2">Verification ID:</p>
                                <p className="font-mono font-black text-emerald-700 text-[11px] tracking-wide">
                                    {verification?.verification_code || docData.verification_id}
                                </p>
                                <p className="text-[8.5px] text-slate-500 mt-0.5">Scan untuk memverifikasi dokumen</p>
                                <p className="text-[8.5px] font-bold text-slate-700">PKLConnect</p>
                            </div>

                            <p className="font-bold text-sm text-slate-900 underline pt-1">Drs. Bambang Suryanto, M.Pd.</p>
                            <p className="text-[11px] text-slate-500">NIP. 19680515 199503 1 004</p>
                        </div>
                    </div>
                </div>

                {/* Info panel: cara kerja verifikasi */}
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4 print:hidden">
                    <QrCode className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div className="text-[12px] text-slate-600 leading-relaxed">
                        <p className="font-bold text-slate-900 mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> QR Code Document Verification</p>
                        <p>
                            Setiap surat tugas kunjungan memiliki identitas digital unik berupa Verification ID dan QR Code.
                            Ketika QR Code dipindai, sistem melakukan validasi langsung ke database PKLConnect untuk memastikan
                            dokumen tersebut terdaftar dan masih berlaku. QR Code memuat identitas dokumen &amp; penanda tangan
                            beserta link verifikasi ber-token — bukan data sensitif surat.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
