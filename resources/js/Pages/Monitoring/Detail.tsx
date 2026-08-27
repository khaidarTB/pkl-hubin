import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { StatCard } from '@/Components/StatCard';
import { UserCheck, Building2, CalendarCheck, BookOpen, GraduationCap, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Attendance, Journal, Assessment } from '@/Types';

interface Props {
    student: {
        id: number;
        name: string;
        email: string;
        nis: string;
        class: string;
        major: string;
        phone: string;
        industry: string;
        industry_address: string;
        school_supervisor: string;
        industry_supervisor: string;
        start_date: string;
        end_date: string;
        status: string;
    };
    stats: {
        attendance_percent: number;
        total_journals: number;
        approved_journals: number;
        temp_score: number;
    };
    attendances: Attendance[];
    journals: Journal[];
    assessment: Assessment | null;
}

export default function MonitoringDetail({ student, stats, attendances, journals, assessment }: Props) {
    return (
        <DashboardLayout>
            <Head title={`Detail PKL ${student.name}`} />

            <div className="mb-6">
                <Link href="/monitoring" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Monitoring</span>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</h1>
                        <p className="text-xs text-slate-500 mt-0.5">NIS: {student.nis} | {student.class} — {student.major}</p>
                    </div>
                    <StatusBadge status={student.status} />
                </div>
            </div>

            {/* Profile & Placement Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Informasi Siswa</span>
                        <p className="text-sm font-extrabold text-slate-900 mt-1">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-600" /> {student.phone || '081298765432'}
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Perusahaan Industri</span>
                        <p className="text-sm font-extrabold text-cyan-700 mt-1">{student.industry}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {student.industry_address}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">Pembimbing Lapangan: <strong>{student.industry_supervisor}</strong></p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pembimbing Sekolah & Periode</span>
                        <p className="text-sm font-extrabold text-slate-900 mt-1">{student.school_supervisor}</p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{student.start_date} s/d {student.end_date}</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Tingkat Presensi"
                    value={`${stats.attendance_percent}%`}
                    description="Kehadiran Terverifikasi GPS"
                    icon={CalendarCheck}
                    color="blue"
                />
                <StatCard
                    title="Jurnal Terisi"
                    value={`${stats.approved_journals} / ${stats.total_journals}`}
                    description="Jurnal Berstatus Approved"
                    icon={BookOpen}
                    color="green"
                />
                <StatCard
                    title="Nilai Akhir Industri"
                    value={assessment ? `${assessment.total_score} / 100` : `${stats.temp_score} / 100`}
                    description="Skor Evaluasi Kompetensi"
                    icon={GraduationCap}
                    color="cyan"
                />
            </div>

            {/* History Tabs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Riwayat Jurnal */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-base mb-4">Riwayat E-Jurnal Siswa</h3>
                    <div className="space-y-3">
                        {journals.map((j) => (
                            <div key={j.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 text-xs">{j.activity}</span>
                                    <StatusBadge status={j.status} size="sm" />
                                </div>
                                <p className="text-[11px] text-slate-600">{j.description}</p>
                                <span className="text-[10px] text-slate-400 font-mono mt-2 block">{j.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Log Presensi */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-base mb-4">Log Presensi Geolocation</h3>
                    <div className="space-y-3">
                        {attendances.map((att) => (
                            <div key={att.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-bold text-slate-900">{att.date}</p>
                                    <p className="text-[11px] text-slate-500">
                                        Masuk: {att.check_in || '-'} | Pulang: {att.check_out || '-'}
                                    </p>
                                </div>
                                <StatusBadge status={att.status} size="sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
