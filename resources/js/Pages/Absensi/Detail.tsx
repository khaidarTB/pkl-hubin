import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import {
    ArrowLeft,
    Clock,
    MapPin,
    SatelliteDish,
    ShieldCheck,
    StickyNote,
    Route,
} from 'lucide-react';
import { Attendance, AttendanceAttempt } from '@/Types';
import { formatDistance } from '@/services/geolocation';

interface Props {
    attendance: Attendance;
    attempt: AttendanceAttempt | null;
    isOwner: boolean;
}

function osmEmbedUrl(lat: number | null | undefined, lng: number | null | undefined): string | null {
    if (lat == null || lng == null) {
        return null;
    }
    const dLat = 0.004;
    const dLng = 0.006;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(String(lng - dLng))}%2C${encodeURIComponent(String(lat - dLat))}%2C${encodeURIComponent(String(lng + dLng))}%2C${encodeURIComponent(String(lat + dLat))}&layer=mapnik&marker=${encodeURIComponent(String(lat))}%2C${encodeURIComponent(String(lng))}`;
}

export default function AbsensiDetail({ attendance, attempt, isOwner }: Props) {
    const student = attendance.student;
    const company = student?.placement?.company;
    const mapLat = attempt?.company_latitude ?? attendance.company_latitude ?? company?.latitude ?? null;
    const mapLng = attempt?.company_longitude ?? attendance.company_longitude ?? company?.longitude ?? null;
    const mapUrl = osmEmbedUrl(mapLat, mapLng);
    const backUrl = isOwner ? '/absensi' : '/absensi';

    return (
        <DashboardLayout>
            <Head title="Detail Absensi" />

            <Link href={backUrl} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-cyan-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> Kembali ke absensi
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom kiri: Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">{student?.user?.name || 'Siswa'}</h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {student?.class} · {student?.major} · {company?.name || 'Tanpa perusahaan'}
                                </p>
                            </div>
                            <StatusBadge status={attendance.status} />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <Info label="Tanggal" value={attendance.date} />
                            <Info label="Waktu Server (Geo)" value={attendance.server_timestamp ? `${attendance.check_in} WIB` : attendance.check_in ? `${attendance.check_in} WIB` : attendance.date} />
                            <Info label="Check-out" value={attendance.check_out ? `${attendance.check_out} WIB` : '-'} />
                            <Info label="Jarak ke Perusahaan" value={formatDistance(attendance.distance_from_company)} icon={Route} />
                            <Info label="GPS Accuracy" value={attendance.gps_accuracy != null ? `±${Math.round(attendance.gps_accuracy)} m` : '-'} icon={SatelliteDish} />
                            <Info label="Status Lokasi" value={attendance.location_status === 'VERIFIED' ? '✓ Terverifikasi' : '-'} icon={ShieldCheck} accent />
                        </div>
                    </div>

                    {attempt && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Log Validasi Server (Audit)</h3>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-2">
                                <Row k="Hasil Validasi" v={String(attempt.result)} />
                                <Row k="Alasan" v={attempt.failure_reason || '-'} />
                                <Row k="Waktu Server" v={attempt.server_timestamp} />
                                <Row k="Jarak Terukur" v={formatDistance(attempt.distance_from_company)} />
                                <Row k="Radius yang Diizinkan" v={attempt.allowed_radius != null ? `${attempt.allowed_radius} m` : '-'} />
                                <Row k="Koordinator Perusahaan" v={attempt.company_latitude != null && attempt.company_longitude != null ? `${attempt.company_latitude}, ${attempt.company_longitude}` : '-'} />
                                {attempt.notes && (
                                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                                        <StickyNote className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                                        <span>{attempt.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kolom kanan: Peta */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-600" /> Peta Lokasi PKL
                        </h3>
                        {mapUrl ? (
                            <iframe
                                src={mapUrl}
                                title="Peta lokasi perusahaan"
                                className="w-full h-64 rounded-2xl border border-slate-200"
                                loading="lazy"
                            />
                        ) : (
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-xs text-slate-400">
                                Koordinat perusahaan belum tersedia.
                            </div>
                        )}
                        {(attendance.location_status === 'VERIFIED' || attendance.location_status === 'REJECTED') && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-50 border border-slate-100 text-xs">
                                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-cyan-600" /> Titik absen
                                    </span>
                                    <span className="font-black text-slate-900">
                                        {attendance.latitude != null && attendance.longitude != null
                                            ? `${Number(attendance.latitude).toFixed(6)}, ${Number(attendance.longitude).toFixed(6)}`
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-600" /> Waktu Server
                        </h3>
                        <p className="text-2xl font-black font-mono text-slate-900">
                            {attendance.server_timestamp ? attendance.check_in : '-'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Absensi divalidasi terhadap waktu server Asia/Jakarta, bukan jam perangkat.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

interface InfoProps {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    accent?: boolean;
}

const Info: React.FC<InfoProps> = ({ label, value, icon: Icon, accent }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
        </span>
        <p className={`mt-1 text-sm font-black ${accent ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p>
    </div>
);

const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
    <div className="flex items-start justify-between gap-3">
        <span className="font-bold text-slate-500">{k}</span>
        <span className="text-right font-semibold text-slate-800">{v}</span>
    </div>
);