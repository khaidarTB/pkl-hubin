import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import {
    ArrowLeft, Printer, Ban, RefreshCcw, QrCode, ShieldCheck,
    XCircle, AlertTriangle, CheckCircle2, FileText, User, Clock,
    ScanLine, History, Building2, GraduationCap, Calendar
} from 'lucide-react';

interface RecentLog {
    id: number;
    verified_at?: string;
    ip_address?: string;
}

interface VerificationDetail {
    id: number;
    document_id: number;
    verification_code: string;
    document_type: string;
    document_number: string;
    status: 'VALID' | 'REVOKED' | 'EXPIRED';
    issued_at?: string;
    verified_at?: string;
    revoked_at?: string;
    verification_count: number;
    document_title?: string;
    verification_token: string;
    qr_payload?: string;
    document: {
        id?: number;
        title?: string;
        type?: string;
        status?: string;
        data: Record<string, any>;
        creator_name?: string;
        template_name?: string;
    };
    recent_logs: RecentLog[];
}

interface Props {
    verification: VerificationDetail;
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatFullDate = (iso?: string): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}, ${time} WIB`;
};

const formatDateShort = (iso?: string): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export default function DocumentVerificationDetail({ verification }: Props) {
    const v = verification;
    const docData = v.document?.data || {};
    const verifyUrl = `${window.location.origin}/verify/${v.verification_token}`;
    const qrValue = v.qr_payload || verifyUrl;

    const handleRevoke = () => {
        if (confirm(`Cabut dokumen ${v.verification_code}? Status berubah menjadi REVOKED dan QR tidak dapat diverifikasi lagi.`)) {
            router.post(`/admin/verifikasi-dokumen/${v.id}/revoke`);
        }
    };

    const handleRegenerate = () => {
        if (confirm(`Regenerate QR Code untuk ${v.verification_code}? Token lama akan dinonaktifkan otomatis.`)) {
            router.post(`/admin/verifikasi-dokumen/${v.id}/regenerate-qr`);
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Detail ${v.verification_code}`} />

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
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link
                        href="/admin/verifikasi-dokumen"
                        className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Verifikasi Dokumen
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            disabled={v.status === 'REVOKED'}
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-[12px] rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Download PDF
                        </button>
                        <button
                            onClick={handleRegenerate}
                            className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" /> Regenerate QR
                        </button>
                        {v.status === 'VALID' && (
                            <button
                                onClick={handleRevoke}
                                className="px-4 py-2 bg-white border border-rose-200 text-rose-600 font-semibold text-[12px] rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                                <Ban className="w-4 h-4" /> Revoke Document
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Official Letter Preview */}
                    <div id="official-letter" className="lg:col-span-2 bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 font-serif border border-slate-200">
                        {/* Kop Surat Resmi */}
                        <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1 font-sans">
                            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide">Pemerintah Provinsi DKI Jakarta</h2>
                            <h3 className="text-lg sm:text-xl font-bold uppercase text-slate-800">Dinas Pendidikan SMK Negeri 1 Jakarta</h3>
                            <p className="text-xs text-slate-600">Jl. Budi Utomo No. 7, Pasar Baru, Sawah Besar, Jakarta Pusat | Telp: (021) 3813630</p>
                            <p className="text-[11px] text-slate-500 font-medium">Website: smkn1jakarta.sch.id • Email: hubin@smkn1jakarta.sch.id</p>
                        </div>

                        {/* Title & Nomor Surat */}
                        <div className="text-center space-y-1 font-sans">
                            <h1 className="text-lg font-black uppercase underline decoration-2 underline-offset-4">
                                {v.document?.type === 'surat_jalan' ? 'Surat Jalan Kunjungan PKL' : 'Surat Tugas Kunjungan Monitoring PKL'}
                            </h1>
                            <p className="text-xs font-semibold text-slate-700">Nomor: {v.document_number}</p>
                        </div>

                        {/* Isi Surat */}
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

                            <p>Demikian Surat Tugas ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                        </div>

                        {/* Penutup surat + QR Verification di kolom tanda tangan */}
                        <div className="pt-4 flex justify-end font-sans">
                            <div className={`text-center w-64 space-y-1.5 ${v.status === 'REVOKED' ? 'opacity-60' : ''}`}>
                                <p className="text-xs text-slate-600">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-xs font-bold text-slate-800 pb-1">Kepala Program Keahlian PKL,</p>

                                {/* QR Code Document Verification — pas di kolom ttd */}
                                <div className="flex flex-col items-center py-1.5">
                                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <QRCodeSVG value={qrValue} size={108} level="M" />
                                    </div>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-2">Verification ID:</p>
                                    <p className="font-mono font-black text-emerald-700 text-[11px] tracking-wide">{v.verification_code}</p>
                                    <p className="text-[8.5px] text-slate-500 mt-0.5">Scan untuk memverifikasi dokumen</p>
                                    <p className="text-[8.5px] font-bold text-slate-700">PKLConnect</p>
                                </div>

                                <p className="font-bold text-sm text-slate-900 underline pt-1">Drs. Bambang Suryanto, M.Pd.</p>
                                <p className="text-[11px] text-slate-500">NIP. 19680515 199503 1 004</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata & Audit */}
                    <div className="space-y-5 lg:sticky lg:top-6">
                        {/* Status Card */}
                        <div className={`rounded-2xl border p-5 space-y-2 ${
                            v.status === 'VALID'
                                ? 'bg-emerald-50 border-emerald-200'
                                : v.status === 'REVOKED'
                                    ? 'bg-rose-50 border-rose-200'
                                    : 'bg-amber-50 border-amber-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                {v.status === 'VALID' ? (
                                    <>
                                        <ShieldCheck className="w-7 h-7 text-emerald-600" />
                                        <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full">Valid</span>
                                    </>
                                ) : v.status === 'REVOKED' ? (
                                    <>
                                        <XCircle className="w-7 h-7 text-rose-600" />
                                        <span className="px-3 py-1 bg-rose-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full">Revoked</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                                        <span className="px-3 py-1 bg-amber-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full">Expired</span>
                                    </>
                                )}
                            </div>
                            <p className="text-[12px] text-slate-600 leading-relaxed">
                                {v.status === 'VALID'
                                    ? 'Dokumen terdaftar pada sistem PKLConnect dan masih berlaku.'
                                    : v.status === 'REVOKED'
                                        ? `Dicabut oleh administrator pada ${formatDateShort(v.revoked_at)}.`
                                        : 'Masa berlaku dokumen telah berakhir.'}
                            </p>
                        </div>

                        {/* Identity Metadata */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <FileText className="w-4 h-4" /> Identitas Verifikasi
                            </h3>
                            <dl className="space-y-3 text-[12px]">
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Verification ID</dt>
                                    <dd className="font-mono font-bold text-emerald-600 text-right">{v.verification_code}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Nomor Surat</dt>
                                    <dd className="font-mono font-bold text-slate-900 text-right">{v.document_number}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Jenis Dokumen</dt>
                                    <dd className="font-semibold text-slate-700 text-right capitalize">{(v.document_type || '').replace('_', ' ')}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Template</dt>
                                    <dd className="font-semibold text-slate-700 text-right">{v.document?.template_name || 'Template Resmi Sekolah'}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Created By</dt>
                                    <dd className="font-semibold text-slate-700 text-right inline-flex items-center gap-1"><User className="w-3 h-3" /> {v.document?.creator_name || '-'}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 shrink-0">Created At</dt>
                                    <dd className="font-semibold text-slate-700 text-right">{formatDateShort(v.issued_at)}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Verification Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                <ScanLine className="w-5 h-5 text-emerald-500 mb-2" />
                                <p className="text-xl font-black text-slate-900 leading-none">{v.verification_count}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Verification Count</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                <Clock className="w-5 h-5 text-emerald-500 mb-2" />
                                <p className="text-[12px] font-bold text-slate-900 leading-tight mt-1">
                                    {v.verified_at ? formatDateShort(v.verified_at) : 'Never'}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Last Verification</p>
                            </div>
                        </div>

                        {/* Audit Trail (terbatas untuk Admin Hubin) */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <History className="w-4 h-4" /> Riwayat Scan Terakhir
                            </h3>
                            {v.recent_logs.length === 0 && (
                                <p className="text-[12px] text-slate-400 italic">Belum pernah diverifikasi.</p>
                            )}
                            <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {v.recent_logs.map((log) => (
                                    <li key={log.id} className="flex items-start gap-2 text-[11px]">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-slate-900 font-semibold">{formatFullDate(log.verified_at)}</p>
                                            <p className="text-slate-500 font-mono">{log.ip_address || 'IP tidak diketahui'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Facts */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-[12px]">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <QrCode className="w-4 h-4 text-emerald-500" /> Ringkasan Surat
                            </h3>
                            <div className="space-y-2 text-slate-600">
                                <p className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {docData.nama_siswa || '-'} ({docData.kelas || '-'})</p>
                                <p className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {docData.nama_industri || '-'}</p>
                                <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {docData.tanggal_kunjungan || '-'} — {docData.tujuan_kunjungan || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
