import React from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { FileSpreadsheet, FileText, Download, Printer, ShieldCheck } from 'lucide-react';

interface Props {
    reports: any[];
}

export default function ReportIndex({ reports }: Props) {
    const handleExportExcel = () => {
        router.post('/laporan/export-excel');
    };

    const handleExportPdf = () => {
        router.post('/laporan/export-pdf');
    };

    return (
        <DashboardLayout>
            <Head title="Laporan & Rekapitulasi PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan & Rekapitulasi PKL</h1>
                    <p className="text-xs text-slate-500 mt-1">Cetak dan ekspor rekapitulasi data presensi, jurnal, serta nilai akhir industri.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Generate PDF</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base">Rekapitulasi Nasional PKL SMK</h3>
                    <span className="text-xs font-semibold text-slate-500">{reports.length} Data Terdaftar</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase">
                            <tr>
                                <th className="p-4">NIS</th>
                                <th className="p-4">Nama Siswa</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Perusahaan PKL</th>
                                <th className="p-4 text-center">Presensi (%)</th>
                                <th className="p-4 text-center">Total Jurnal</th>
                                <th className="p-4 text-center">Nilai Akhir</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {reports.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-mono font-bold text-slate-900">{r.nis}</td>
                                    <td className="p-4 font-bold text-slate-900">{r.name}</td>
                                    <td className="p-4">{r.class} ({r.major})</td>
                                    <td className="p-4 text-slate-700">{r.industry}</td>
                                    <td className="p-4 text-center font-bold text-emerald-600">{r.attendance_percent}</td>
                                    <td className="p-4 text-center">{r.journal_total}</td>
                                    <td className="p-4 text-center font-bold text-cyan-600">{r.score}</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={r.status} size="sm" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
