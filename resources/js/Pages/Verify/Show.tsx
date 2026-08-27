import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    XCircle,
    AlertTriangle,
    CheckCircle2,
    ArrowLeft,
    Clock,
    History,
    ScanLine
} from 'lucide-react';

interface VerificationPayload {
    id: number;
    verification_code: string;
    document_number: string;
    document_type: string;
    status: 'VALID' | 'REVOKED' | 'EXPIRED';
    verified_at?: string;
    revoked_at?: string;
    created_at?: string;
    logs_count?: number;
    document?: {
        title?: string;
        data: Record<string, any>;
    };
}

interface Props {
    status: 'VALID' | 'REVOKED' | 'EXPIRED' | 'INVALID';
    verification?: VerificationPayload | null;
    last_verified?: string | null;
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatTanggal = (iso?: string): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export default function VerifyShow({ status, verification, last_verified }: Props) {
    const doc = verification?.document;
    const docData = doc?.data || {};

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
                        P
                    </div>
                    <div>
                        <span className="font-extrabold text-lg tracking-tight text-white block">PKLConnect</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Digital Document Verification System</span>
                    </div>
                </Link>

                <Link
                    href="/"
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    Portal Beranda
                </Link>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto w-full my-8 relative z-10 space-y-6">
                {/* 1. VALID STATUS */}
                {status === 'VALID' && verification && (
                    <>
                        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-md">
                            {/* Status Banner */}
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/20">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full inline-block">
                                    🟢 DOKUMEN TERVERIFIKASI
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-white">Keaslian Dokumen Terverifikasi</h1>
                                <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
                                    Dokumen ini terdaftar pada sistem PKLConnect dan masih berlaku.
                                </p>
                            </div>

                            {/* Document Metadata Card */}
                            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <ShieldCheck className="w-4 h-4" /> Informasi Dokumen
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Verification ID</span>
                                        <span className="font-mono font-bold text-emerald-400 text-base">{verification.verification_code}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Nomor Surat</span>
                                        <span className="font-mono font-bold text-white">{verification.document_number}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Jenis Dokumen</span>
                                        <span className="font-bold text-slate-200 capitalize">{(verification.document_type || '').replace('_', ' ')}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Guru Pembimbing</span>
                                        <span className="font-bold text-slate-200">{docData.nama_guru || '-'}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Siswa</span>
                                        <span className="font-bold text-slate-200">{docData.nama_siswa || '-'}{docData.kelas ? ` (${docData.kelas})` : ''}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Perusahaan</span>
                                        <span className="font-bold text-slate-200">{docData.nama_industri || '-'}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Tanggal Kunjungan</span>
                                        <span className="font-bold text-slate-200">{docData.tanggal_kunjungan || '-'}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Tujuan</span>
                                        <span className="font-bold text-slate-200">{docData.tujuan_kunjungan || '-'}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Tanggal Diterbitkan</span>
                                        <span className="font-bold text-slate-200">{formatTanggal(verification.created_at)}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Status</span>
                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4" /> 🟢 VALID
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Timeline */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3 backdrop-blur-md">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <History className="w-4 h-4 text-emerald-400" /> Document Status
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-300">
                                <li className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Dokumen diterbitkan ({formatTanggal(verification.created_at)})
                                </li>
                                <li className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Verification ID dibuat ({verification.verification_code})
                                </li>
                                <li className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> QR Code terdaftar pada sistem PKLConnect
                                </li>
                                <li className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Dokumen masih berlaku
                                </li>
                            </ul>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Verified:</span>
                                <span className="font-mono text-emerald-300 font-bold">
                                    {last_verified || 'Belum pernah diverifikasi sebelumnya'}
                                </span>
                            </div>
                            {typeof verification.logs_count === 'number' && verification.logs_count > 0 && (
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="inline-flex items-center gap-1.5"><ScanLine className="w-3.5 h-3.5" /> Total Scan:</span>
                                    <span className="font-mono text-emerald-300 font-bold">{verification.logs_count}x</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* 2. REVOKED STATUS — data sensitif tidak ditampilkan */}
                {status === 'REVOKED' && verification && (
                    <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center backdrop-blur-md">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-rose-500/20">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <span className="px-3.5 py-1 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-full inline-block">
                            🔴 DOKUMEN TIDAK BERLAKU
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-white">Dokumen Telah Dicabut</h1>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                            Dokumen ini telah dicabut oleh administrator dan tidak dapat digunakan sebagai dokumen resmi.
                        </p>
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl max-w-md mx-auto text-left text-xs space-y-1">
                            <p><span className="text-slate-400">Verification ID:</span> <strong className="text-rose-400 font-mono">{verification.verification_code}</strong></p>
                            <p><span className="text-slate-400">Nomor Surat:</span> <strong className="text-white font-mono">{verification.document_number}</strong></p>
                            <p><span className="text-slate-400">Status:</span> <strong className="text-rose-400">🔴 REVOKED</strong></p>
                        </div>
                    </div>
                )}

                {/* 3. EXPIRED STATUS */}
                {status === 'EXPIRED' && verification && (
                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center backdrop-blur-md">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/20">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <span className="px-3.5 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full inline-block">
                            🟡 DOKUMEN KADALUARSA
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-white">Masa Berlaku Dokumen Berakhir</h1>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                            Dokumen ini pernah diterbitkan oleh PKLConnect, tetapi masa berlakunya telah berakhir.
                        </p>
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl max-w-md mx-auto text-left text-xs space-y-1">
                            <p><span className="text-slate-400">Verification ID:</span> <strong className="text-amber-400 font-mono">{verification.verification_code}</strong></p>
                            <p><span className="text-slate-400">Nomor Surat:</span> <strong className="text-white font-mono">{verification.document_number}</strong></p>
                        </div>
                    </div>
                )}

                {/* 4. INVALID / UNKNOWN TOKEN */}
                {status === 'INVALID' && (
                    <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center backdrop-blur-md">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-2">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <span className="px-3.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-xs uppercase tracking-widest rounded-full inline-block">
                            🔴 DOKUMEN TIDAK DAPAT DIVERIFIKASI
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-white">Kode Verifikasi Tidak Ditemukan</h1>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                            Kode verifikasi tidak ditemukan pada sistem PKLConnect.
                        </p>

                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl max-w-md mx-auto text-left text-xs text-slate-400 space-y-1">
                            <p className="font-bold text-slate-200 mb-1">Kemungkinan:</p>
                            <p>• QR Code rusak atau tidak terbaca sempurna</p>
                            <p>• URL verifikasi tidak valid</p>
                            <p>• Dokumen tidak terdaftar pada sistem</p>
                            <p>• Token telah diubah</p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/"
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 hover:brightness-110"
                            >
                                <ArrowLeft className="w-4 h-4" /> Kembali ke PKLConnect
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p>PKLConnect Digital Document Verification System</p>
                <p>© 2026 PKLConnect. Verifikasi dilakukan langsung terhadap database sistem.</p>
            </footer>
        </div>
    );
}
