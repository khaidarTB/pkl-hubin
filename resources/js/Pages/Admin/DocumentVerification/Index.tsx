import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { ShieldCheck, QrCode, Search, Eye, Ban, CheckCircle2, XCircle, AlertTriangle, FileText, ScanLine } from 'lucide-react';

interface VerificationRow {
    id: number; document_id: number; verification_code: string; document_type: string;
    document_number: string; status: 'VALID' | 'REVOKED' | 'EXPIRED';
    issued_at?: string; verified_at?: string; revoked_at?: string;
    verification_count: number; document_title?: string;
}
interface Props {
    verifications: VerificationRow[];
    stats: { total: number; valid: number; revoked: number; expired: number; scans: number };
    filters: { status: string; search: string };
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const formatDate = (iso?: string) => { if (!iso) return '-'; const d = new Date(iso); return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`; };

export default function DocumentVerificationIndex({ verifications, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const applyFilters = (status: string) => { router.get('/admin/verifikasi-dokumen', { status, search }, { preserveState: true, replace: true }); };
    const submitSearch = (e: React.FormEvent) => { e.preventDefault(); router.get('/admin/verifikasi-dokumen', { status: filters.status, search }, { preserveState: true, replace: true }); };

    const filterTabs = [
        { key: 'ALL', label: 'Semua' }, { key: 'VALID', label: 'Valid' },
        { key: 'REVOKED', label: 'Dicabut' }, { key: 'EXPIRED', label: 'Kadaluarsa' },
    ];

    return (
        <DashboardLayout>
            <Head title="Verifikasi Dokumen" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Verifikasi Dokumen</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Identitas digital unik (Verification ID + QR Code) untuk setiap surat.</p>
                    </div>
                    <form onSubmit={submitSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ID / Nomor Surat..."
                                className="w-56 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <button type="submit" className="px-3 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-lg hover:bg-slate-800">Cari</button>
                    </form>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Total', value: stats.total, icon: FileText, color: 'text-slate-600 bg-slate-100' },
                        { label: 'Valid', value: stats.valid, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Dicabut', value: stats.revoked, icon: XCircle, color: 'text-rose-600 bg-rose-50' },
                        { label: 'Kadaluarsa', value: stats.expired, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Total Scan', value: stats.scans, icon: ScanLine, color: 'text-emerald-600 bg-emerald-50' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-start gap-2.5">
                                <div className={`p-2 rounded-lg ${stat.color}`}><Icon className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1.5">
                    {filterTabs.map((tab) => (
                        <button key={tab.key} onClick={() => applyFilters(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                                filters.status === tab.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}>{tab.label}</button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3">Verification ID</th>
                                    <th className="px-5 py-3">Dokumen</th>
                                    <th className="px-5 py-3">Diterbitkan</th>
                                    <th className="px-5 py-3">Scan Terakhir</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {verifications.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-3">
                                            <span className="font-mono font-semibold text-emerald-600">{v.verification_code}</span>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{v.document_number}</p>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-900 max-w-[200px] truncate">{v.document_title || 'Dokumen PKL'}</td>
                                        <td className="px-5 py-3 text-slate-500">{formatDate(v.issued_at)}</td>
                                        <td className="px-5 py-3 text-slate-500">{v.verified_at ? formatDate(v.verified_at) : '-'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                v.status === 'VALID' ? 'bg-emerald-50 text-emerald-700' :
                                                v.status === 'REVOKED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                            }`}>{v.status}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link href={`/admin/verifikasi-dokumen/${v.id}`}
                                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 inline-flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Detail
                                                </Link>
                                                {v.status === 'VALID' && (
                                                    <button onClick={() => { if (confirm(`Cabut ${v.verification_code}?`)) router.post(`/admin/verifikasi-dokumen/${v.id}/revoke`); }}
                                                        className="px-2.5 py-1 bg-rose-50 text-rose-700 font-semibold rounded-lg hover:bg-rose-100 inline-flex items-center gap-1">
                                                        <Ban className="w-3 h-3" /> Revoke
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {verifications.length === 0 && (
                                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-[13px]">Tidak ada dokumen ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
