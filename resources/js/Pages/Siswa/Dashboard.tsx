import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatCard } from '@/Components/StatCard';
import { StatusBadge } from '@/Components/StatusBadge';
import { CalendarCheck, BookOpen, GraduationCap, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Student, Attendance } from '@/Types';

interface Props {
    studentName: string;
    student: Student | null;
    todayAttendance: Attendance | null;
    stats: { status_pkl: string; attendance_percent: string; journal_filled: string; days_count: number };
}

export default function SiswaDashboard({ studentName, student, todayAttendance, stats }: Props) {

    return (
        <DashboardLayout>
            <Head title="Dashboard Siswa" />

            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Halo, {studentName}!</h1>
                        <p className="text-emerald-100 text-[13px] mt-1">{student?.class} - {student?.major} | NIS: {student?.nis}</p>
                        <p className="text-emerald-200 text-[12px] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {student?.placement?.industry?.name || 'PT Digital Nusantara'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!todayAttendance?.check_in ? (
                            <Link href="/absensi"
                                className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-[12px] hover:bg-emerald-50 transition-colors flex items-center gap-1.5">
                                <CalendarCheck className="w-4 h-4" /> Absen Masuk
                            </Link>
                        ) : (
                            <div className="px-4 py-2 rounded-xl bg-white/20 text-white text-[12px] font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Sudah Absen ({todayAttendance.check_in})
                            </div>
                        )}
                        <Link href="/jurnal"
                            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-[12px] hover:bg-white/20 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Isi Jurnal
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Status PKL" value={stats.status_pkl} icon={ShieldCheck} color="green" />
                <StatCard title="Kehadiran" value={stats.attendance_percent} icon={CalendarCheck} color="blue" />
                <StatCard title="Jurnal" value={stats.journal_filled} icon={BookOpen} color="cyan" />
                <StatCard title="Hari Berjalan" value={`${stats.days_count} Hari`} icon={Clock} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[14px] mb-3">Presensi Hari Ini</h3>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${todayAttendance?.check_in ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500 font-medium">Check-In</p>
                                <h4 className="text-[15px] font-bold text-slate-900">{todayAttendance?.check_in ? todayAttendance.check_in + ' WIB' : 'Belum Absen'}</h4>
                            </div>
                        </div>
                        <StatusBadge status={todayAttendance?.status || 'Belum Absen'} />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Link href="/absensi" className="text-[12px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">Lihat Lengkap <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[14px] mb-2">Panduan E-Jurnal</h3>
                    <p className="text-[12px] text-slate-500 leading-relaxed">Isi kegiatan harian sebelum pukul 17:00 WIB.</p>
                    <ul className="mt-3 space-y-1.5 text-[12px] text-slate-600">
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tuliskan aktivitas secara rinci.</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sebutkan kendala & solusi.</li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">Status Jurnal Terakhir</span>
                        <StatusBadge status="Approved" size="sm" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
