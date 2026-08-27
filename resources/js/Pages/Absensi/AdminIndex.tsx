import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { CalendarCheck, Search, Filter, MapPin } from 'lucide-react';
import { Attendance } from '@/Types';

interface Props {
    attendances: any[];
}

export default function AbsensiAdminIndex({ attendances }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filtered = attendances.filter((att) => {
        const studentName = att.student?.user?.name || '';
        const matchSearch = studentName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || att.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <DashboardLayout>
            <Head title="Rekap Presensi Siswa PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rekap Presensi Siswa PKL</h1>
                    <p className="text-xs text-slate-500 mt-1">Monitoring log kehadiran harian seluruh siswa PKL di perusahaan mitra.</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                    >
                        <option value="All">Semua Status</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Alpa">Alpa</option>
                    </select>
                </div>
            </div>

            {/* Table Presensi Siswa */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Daftar Presensi Geolocation Siswa</h3>
                        <p className="text-xs text-slate-500">Menampilkan {filtered.length} log kehadiran terbaru</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Nama Siswa</th>
                                <th className="p-4">Kelas & Jurusan</th>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Jam Masuk</th>
                                <th className="p-4">Jam Pulang</th>
                                <th className="p-4">Lokasi Verifikasi</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada log presensi ditemukan.</td>
                                </tr>
                            ) : (
                                filtered.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{att.student?.user?.name || 'Siswa'}</td>
                                        <td className="p-4">{att.student?.class || '-'} ({att.student?.major || '-'})</td>
                                        <td className="p-4 font-bold text-slate-800">{att.date}</td>
                                        <td className="p-4">{att.check_in || '-'}</td>
                                        <td className="p-4">{att.check_out || '-'}</td>
                                        <td className="p-4 text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                            <span>{att.location_address || 'PT Digital Nusantara'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={att.status} size="sm" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
