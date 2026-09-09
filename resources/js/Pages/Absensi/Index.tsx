import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { SmartGeoAttendance } from '@/Components/SmartGeoAttendance';
import { ChevronLeft, ChevronRight, MapPin, History } from 'lucide-react';
import { Attendance, Student } from '@/Types';
import type { GeoAttendanceConfig, GeoValidationCompany } from '@/Types/attendance';
import { formatDistance } from '@/services/geolocation';

interface HistoryPage {
    data: Attendance[];
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    student: Student | null;
    company: GeoValidationCompany | null;
    todayAttendance: Attendance | null;
    history: HistoryPage;
    todayDate: string;
    currentTime: string;
    config: GeoAttendanceConfig;
}

export default function AbsensiIndex({ student, company, todayAttendance, history, todayDate, currentTime, config }: Props) {

    return (
        <DashboardLayout>
            <Head title="Presensi GPS Pintar" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Presensi GPS Pintar</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Absensi berbasis GPS + radius perusahaan + waktu server. Validasi final dilakukan oleh server.
                </p>
            </div>

            <div className="max-w-3xl mb-8">
                <SmartGeoAttendance
                    company={company}
                    todayAttendance={todayAttendance}
                    todayDate={todayDate}
                    initialTime={currentTime}
                    config={config}
                />
            </div>

            {/* Riwayat Absensi */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <History className="w-4 h-4 text-cyan-600" /> Riwayat Absensi
                        </h3>
                        <p className="text-xs text-slate-500">{student?.class} · {student?.major}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Waktu Server</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Jarak</th>
                                <th className="p-4">Lokasi</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {history.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">Belum ada riwayat absensi.</td>
                                </tr>
                            ) : (
                                history.data.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{att.date}</td>
                                        <td className="p-4">
                                            {att.server_timestamp
                                                ? `${att.check_in} WIB`
                                                : att.check_in
                                                  ? `${att.check_in} WIB`
                                                  : '-'}
                                        </td>
                                        <td className="p-4"><StatusBadge status={att.status} size="sm" /></td>
                                        <td className="p-4 font-semibold">{formatDistance(att.distance_from_company)}</td>
                                        <td className="p-4 text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                            <span>
                                                {att.location_status === 'VERIFIED' ? '✓ Terverifikasi' : '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/absensi/${att.id}`} className="text-cyan-700 font-bold hover:underline">
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {(history.prev_page_url || history.next_page_url) && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={!history.prev_page_url}
                            onClick={() => history.prev_page_url && router.visit(history.prev_page_url)}
                            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Sebelumnya
                        </button>
                        <button
                            type="button"
                            disabled={!history.next_page_url}
                            onClick={() => history.next_page_url && router.visit(history.next_page_url)}
                            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 flex items-center gap-1"
                        >
                            Berikutnya <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}