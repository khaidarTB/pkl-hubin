import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { CheckSquare, GraduationCap, Users, Clock, Check, X, Sparkles } from 'lucide-react';

interface Props {
    supervisor: string;
    students: any[];
    pendingApprovals: any[];
}

export default function IndustriDashboard({ supervisor, students, pendingApprovals }: Props) {
    const handleApprove = (id: number) => {
        router.put(`/jurnal/${id}/approve`);
    };

    const handleRevision = (id: number) => {
        const note = prompt('Masukkan catatan revisi untuk siswa:');
        if (note) {
            router.put(`/jurnal/${id}/revision`, { revision_note: note });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard Pembimbing Industri" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Portal Pembimbing Industri</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Pembimbing: {supervisor}</p>
                </div>
                <Link
                    href="/penilaian"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold text-[12px] hover:bg-slate-800 transition-colors"
                >
                    <GraduationCap className="w-4 h-4" />
                    <span>Input Penilaian</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Jurnal Menunggu Approval"
                    value={`${pendingApprovals.length} Jurnal`}
                    description="Perlu verifikasi Anda"
                    icon={CheckSquare}
                    color="amber"
                />
                <StatCard
                    title="Siswa PKL Industri"
                    value={`${students.length} Siswa`}
                    description="Dibimbing di perusahaan Anda"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Penilaian Terinput"
                    value={`${students.filter(s => s.has_assessment).length} / ${students.length}`}
                    description="Lembar penilaian kompetensi"
                    icon={GraduationCap}
                    color="green"
                />
            </div>

            {/* Pending Approvals Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Approval Jurnal Kegiatan Siswa</h3>
                        <p className="text-xs text-slate-500">Verifikasi deskripsi pekerjaan & skill harian siswa</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {pendingApprovals.length} Menunggu Verifikasi
                    </span>
                </div>

                {pendingApprovals.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                        Semua jurnal siswa telah disetujui! 🎉
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingApprovals.map((j) => (
                            <div key={j.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 text-sm">{j.student.user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">({j.date})</span>
                                    </div>
                                    <h4 className="text-[12px] font-bold text-slate-900">{j.activity}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{j.description}</p>
                                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">Skill: {j.skill}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleApprove(j.id)}
                                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>Setujui</span>
                                    </button>
                                    <button
                                        onClick={() => handleRevision(j.id)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Revisi</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
