import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { Search, Filter, MapPin, ChevronLeft, ChevronRight, ShieldCheck, Clock, SatelliteDish } from 'lucide-react';
import { Attendance, Company } from '@/Types';
import { formatDistance } from '@/services/geolocation';

interface Filters {
    date: string;
    class: string;
    company_id: string;
    status: string;
    search: string;
}

interface Props {
    attendances: {
        data: Attendance[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    companies: Pick<Company, 'id' | 'name'>[];
    classes: string[];
    filters: Filters;
    stats: { hadir: number; terlambat: number; attempts_rejected: number };
}

export default function AbsensiAdminIndex({ attendances, companies, classes, filters, stats }: Props) {
    const [form, setForm] = useState<Filters>(filters);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (form.date) params.date = form.date;
        if (form.class) params.class = form.class;
        if (form.company_id) params.company_id = form.company_id;
        if (form.status) params.status = form.status;
        if (form.search.trim()) params.search = form.search.trim();
        router.get('/absensi', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setForm({ date: '', class: '', company_id: '', status: '', search: '' });
        router.get('/absensi', {}, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout>
            <Head title="Monitoring Absensi Siswa PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monitoring Absensi Siswa PKL</h1>
                    <p className="text-xs text-slate-500 mt-1">Log absensi geo-validasi (GPS + radius + waktu server).</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Hadir</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{stats.hadir}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Terlambat</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{stats.terlambat}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Percobaan Ditolak</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{stats.attempts_rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa..."
                            value={form.search}
                            onChange={(e) => setForm({ ...form, search: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                    <select
                        value={form.class}
                        onChange={(e) => setForm({ ...form, class: e.target.value })}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={form.company_id}
                        onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">Semua Perusahaan</option>
                        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Terlambat">Terlambat</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alpa">Alpa</option>
                    </select>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 flex items-center gap-1.5"
                    >
                        <Filter className="w-3.5 h-3.5" /> Terapkan Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Daftar Absensi Terverifikasi</h3>
                        <p className="text-xs text-slate-500">Menampilkan {attendances.data.length} dari {attendances.total} log</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Siswa</th>
                                <th className="p-4">Kelas</th>
                                <th className="p-4">Perusahaan</th>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Waktu Server</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Jarak</th>
                                <th className="p-4">GPS Acc.</th>
                                <th className="p-4">Lokasi</th>
                                <th className="p-4">Waktu</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {attendances.data.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-slate-400">Tidak ada data absensi ditemukan.</td>
                                </tr>
                            ) : (
                                attendances.data.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{att.student?.user?.name || 'Siswa'}</td>
                                        <td className="p-4">{att.student?.class || '-'}</td>
                                        <td className="p-4 text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                            {att.student?.placement?.company?.name || '-'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">{att.date}</td>
                                        <td className="p-4">{att.check_in ? `${att.check_in} WIB` : '-'}</td>
                                        <td className="p-4"><StatusBadge status={att.status} size="sm" /></td>
                                        <td className="p-4 font-semibold">{formatDistance(att.distance_from_company)}</td>
                                        <td className="p-4">
                                            {att.gps_accuracy != null ? (
                                                <span className="flex items-center gap-1"><SatelliteDish className="w-3.5 h-3.5 text-slate-400" />±{Math.round(att.gps_accuracy)} m</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4">
                                            {att.location_status === 'VERIFIED' ? (
                                                <span className="flex items-center gap-1 text-emerald-700 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />Verified</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4">
                                            {att.time_status === 'ON_TIME' ? (
                                                <span className="flex items-center gap-1 text-emerald-700 font-bold"><Clock className="w-3.5 h-3.5 text-emerald-600" />Tepat</span>
                                            ) : att.time_status === 'LATE' ? (
                                                <span className="flex items-center gap-1 text-amber-700 font-bold"><Clock className="w-3.5 h-3.5 text-amber-600" />Terlambat</span>
                                            ) : '-'}
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

                {(attendances.prev_page_url || attendances.next_page_url) && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={!attendances.prev_page_url}
                            onClick={() => attendances.prev_page_url && router.visit(attendances.prev_page_url, { preserveState: true })}
                            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Sebelumnya
                        </button>
                        <span className="text-xs font-semibold text-slate-500">Halaman {attendances.current_page} dari {attendances.last_page}</span>
                        <button
                            type="button"
                            disabled={!attendances.next_page_url}
                            onClick={() => attendances.next_page_url && router.visit(attendances.next_page_url, { preserveState: true })}
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