import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { CalendarCheck, MapPin, Clock, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import { Attendance } from '@/Types';

interface Props {
    attendances: Attendance[];
    todayAttendance: Attendance | null;
    todayDate: string;
    currentTime: string;
}

export default function AbsensiIndex({ attendances, todayAttendance, todayDate, currentTime }: Props) {
    const [loading, setLoading] = useState(false);

    const handleCheckIn = () => {
        setLoading(true);
        router.post('/absensi/checkin', {
            latitude: -6.2088,
            longitude: 106.8456,
        }, {
            onFinish: () => setLoading(false),
        });
    };

    const handleCheckOut = () => {
        setLoading(true);
        router.post('/absensi/checkout', {}, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Presensi PKL Geolocation" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Presensi Digital Geolocation</h1>
                <p className="text-xs text-slate-500 mt-1">Pencatatan waktu masuk dan pulang dengan verifikasi GPS lokasi industri.</p>
            </div>

            {/* Checkin / Checkout Main Action Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                        <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{todayDate}</span>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">{currentTime} WIB</h2>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-cyan-600" />
                            <span>PT Digital Nusantara (Radius GPS: Terverifikasi &lt; 50m)</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!todayAttendance?.check_in ? (
                            <button
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                <span>Absen Masuk (Check-In)</span>
                            </button>
                        ) : !todayAttendance?.check_out ? (
                            <button
                                onClick={handleCheckOut}
                                disabled={loading}
                                className="px-6 py-3.5 rounded-2xl bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                <span>Absen Pulang (Check-Out)</span>
                            </button>
                        ) : (
                            <div className="px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Presensi Hari Ini Selesai</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Waktu Check-In</span>
                        <p className="text-lg font-black text-slate-900 mt-0.5">
                            {todayAttendance?.check_in ? `${todayAttendance.check_in} WIB` : 'Belum Melakukan'}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Waktu Check-Out</span>
                        <p className="text-lg font-black text-slate-900 mt-0.5">
                            {todayAttendance?.check_out ? `${todayAttendance.check_out} WIB` : 'Belum Melakukan'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Attendance History Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-900 text-base">Riwayat Presensi PKL</h3>
                    <p className="text-xs text-slate-500">Log kehadiran harian Anda selama periode PKL</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Jam Masuk</th>
                                <th className="p-4">Jam Pulang</th>
                                <th className="p-4">Lokasi Verifikasi</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {attendances.map((att) => (
                                <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-bold text-slate-900">{att.date}</td>
                                    <td className="p-4">{att.check_in || '-'}</td>
                                    <td className="p-4">{att.check_out || '-'}</td>
                                    <td className="p-4 text-slate-600">{att.location_address || 'PT Digital Nusantara'}</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={att.status} size="sm" />
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
