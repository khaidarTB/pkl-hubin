import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { PklApplication, Placement, Student } from '@/Types';
import { CheckCircle2, Clock, MapPin, Building2, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props { student: Student | null; application: PklApplication | null; placement: Placement | null; }

export default function PklStatus({ student, application, placement }: Props) {
    const steps = [
        { title: 'Pendaftaran', desc: 'Formulir dan unggah berkas.', status: application ? 'completed' : 'current', date: application?.submitted_at ? new Date(application.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-' },
        { title: 'Verifikasi Hubin', desc: 'Review berkas dan kuota.', status: application?.status === 'approved' ? 'completed' : application?.status === 'revision' ? 'warning' : application ? 'current' : 'upcoming', date: application?.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-' },
        { title: 'Penempatan', desc: 'Surat Tugas dan pembagian guru.', status: placement ? 'completed' : application?.status === 'approved' ? 'current' : 'upcoming', date: placement?.placed_at ? new Date(placement.placed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-' },
        { title: 'Pelaksanaan', desc: 'Absensi, jurnal, kunjungan, penilaian.', status: placement?.status === 'Aktif' ? 'completed' : 'upcoming', date: placement?.start_date ? `${placement.start_date} s/d ${placement.end_date}` : '-' },
    ];

    return (
        <DashboardLayout>
            <Head title="Status PKL" />
            <div className="space-y-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Status Timeline PKL</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Pantau progres dari pendaftaran hingga pelaksanaan.</p>
                    </div>
                    {!application && (
                        <Link href="/pkl/pendaftaran" className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-1.5 self-start">
                            Isi Formulir <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                        <h3 className="text-[14px] font-bold text-slate-900">Tahapan Siklus PKL</h3>
                        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                            {steps.map((step, idx) => {
                                const isDone = step.status === 'completed';
                                const isCurrent = step.status === 'current';
                                const isWarning = step.status === 'warning';
                                return (
                                    <div key={idx} className="relative">
                                        <div className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-emerald-500 text-white animate-pulse' : isWarning ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 ml-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-slate-900 text-[13px]">{step.title}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    isDone ? 'bg-emerald-50 text-emerald-700' : isCurrent ? 'bg-emerald-50 text-emerald-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                }`}>{isDone ? 'Selesai' : isCurrent ? 'Proses' : isWarning ? 'Revisi' : 'Belum'}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">{step.desc}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">{step.date}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        {placement ? (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                                <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4" /> Surat Penempatan
                                </div>
                                <div className="space-y-3 text-[12px]">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                        <p className="text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> Perusahaan</p>
                                        <p className="font-bold text-slate-900 mt-0.5">{placement.company?.name || application?.company_name}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                        <p className="text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Guru Pembimbing</p>
                                        <p className="font-semibold text-slate-900 mt-0.5">{placement.schoolSupervisor?.name || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                        <p className="text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Durasi</p>
                                        <p className="font-semibold text-slate-900 mt-0.5">{placement.start_date} s/d {placement.end_date}</p>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold mt-1 inline-block">{placement.status}</span>
                                    </div>
                                </div>
                                <Link href="/absensi" className="w-full py-2.5 bg-slate-900 text-white font-bold text-[12px] rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800">
                                    Mulai Absensi <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center space-y-2">
                                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                                <h4 className="font-semibold text-slate-900 text-[13px]">Menunggu Penempatan</h4>
                                <p className="text-[12px] text-slate-500">Hubin akan menerbitkan surat penempatan setelah pengajuan disetujui.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
