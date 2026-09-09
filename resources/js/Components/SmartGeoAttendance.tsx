import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    LocateFixed,
    MapPin,
    Navigation,
    SatelliteDish,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import type { Attendance } from '@/Types';
import type {
    AttendanceFailureReason,
    AttendanceResultStatus,
    GeoAttendanceConfig,
    GeoAttendancePhase,
    GeoAttendanceResult,
    GeoValidationCompany,
    StudentLocation,
} from '@/Types/attendance';
import { estimateDistance, formatDistance, getCurrentLocation, getGeolocationErrorMessage } from '@/services/geolocation';
import { submitGeoAttendance } from '@/services/attendance';

interface Props {
    company: GeoValidationCompany | null;
    todayAttendance: Attendance | null;
    todayDate: string;
    initialTime: string;
    config: GeoAttendanceConfig;
}

const FAILURE_LABELS: Record<AttendanceFailureReason, string> = {
    LOCATION_OUTSIDE_RADIUS: 'Anda berada di luar radius lokasi PKL.',
    GPS_ACCURACY_TOO_LOW: 'Akurasi GPS terlalu rendah.',
    OUTSIDE_ATTENDANCE_TIME: 'Di luar jendela waktu absensi masuk.',
    STUDENT_NOT_ASSIGNED_TO_COMPANY: 'Anda tidak memiliki penempatan PKL aktif.',
    COMPANY_LOCATION_NOT_CONFIGURED: 'Koordinat perusahaan belum dikonfigurasi admin.',
    ALREADY_ATTENDED: 'Absensi hari ini sudah tercatat.',
};

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const SmartGeoAttendance: React.FC<Props> = ({
    company,
    todayAttendance,
    todayDate,
    initialTime,
    config,
}) => {
    const [phase, setPhase] = useState<GeoAttendancePhase>('idle');
    const [location, setLocation] = useState<StudentLocation | null>(null);
    const [result, setResult] = useState<GeoAttendanceResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [clock, setClock] = useState<string>(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setClock(
                now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const busy = phase === 'getting_location' || phase === 'validating' || phase === 'submitting';
    const alreadyAttended = Boolean(todayAttendance?.check_in);
    const companyConfigured = Boolean(company?.latitude && company.longitude);

    const previewDistance = useMemo(
        () => (location && company && companyConfigured ? estimateDistance(location, company) : null),
        [location, company, companyConfigured],
    );

    const handleAbsen = async () => {
        if (busy || alreadyAttended || !companyConfigured) {
            return;
        }

        setResult(null);
        setErrorMessage(null);
        setLocation(null);
        setPhase('getting_location');

        let loc: StudentLocation;
        try {
            loc = await getCurrentLocation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Gagal mendapatkan lokasi.');
            setPhase('error');
            return;
        }

        setLocation(loc);
        setPhase('validating');
        await delay(500);
        setPhase('submitting');

        const submission = await submitGeoAttendance(loc);

        if (submission.ok) {
            setResult(submission.result);
            setPhase('success');
            router.reload({ only: ['todayAttendance', 'history', 'stats'] });
        } else if (submission.reason === 'REJECTED') {
            setResult(submission.result);
            setErrorMessage(submission.result.message);
            setPhase('error');
        } else {
            setErrorMessage(submission.message);
            setPhase('error');
        }
    };

    const renderAction = () => {
        if (alreadyAttended) {
            return (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <p className="font-extrabold text-sm">Absensi Hari Ini Sudah Tercatat</p>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                        Check-in pukul <span className="font-bold">{todayAttendance?.check_in} WIB</span>
                        {todayAttendance?.check_out ? ` · Check-out ${todayAttendance.check_out} WIB` : ''}
                    </p>
                </div>
            );
        }

        return (
            <button
                type="button"
                onClick={handleAbsen}
                disabled={busy || !companyConfigured}
                className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {phase === 'getting_location' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Mendeteksi Lokasi...
                    </>
                ) : phase === 'validating' ? (
                    <>
                        <LocateFixed className="w-5 h-5 animate-pulse" /> GPS Ditemukan — Memverifikasi...
                    </>
                ) : phase === 'submitting' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Mengirim Absensi...
                    </>
                ) : (
                    <>
                        <Navigation className="w-5 h-5" /> ABSEN SEKARANG
                    </>
                )}
            </button>
        );
    };

    const renderResult = () => {
        if (!result) {
            return null;
        }

        const status = result.status as AttendanceResultStatus;
        const reason = result.failure_reason as AttendanceFailureReason | null;

        if (status === 'HADIR' || status === 'TERLAMBAT') {
            const isLate = status === 'TERLAMBAT';
            return (
                <div className={`p-6 rounded-2xl border ${isLate ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl ${isLate ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {isLate ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-black text-lg text-slate-900">{isLate ? 'ABSENSI TERCATAT' : 'ABSENSI BERHASIL'}</p>
                            <p className="text-xs text-slate-500">{result.server_date}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <Detail label="Waktu Server" value={`${result.server_time}`} icon={Clock} />
                        <Detail label="Jarak ke Perusahaan" value={formatDistance(result.distance_from_company)} icon={MapPin} />
                        <Detail label="GPS Accuracy" value={`${Math.round(result.gps_accuracy)} m`} icon={SatelliteDish} />
                        <Detail label="Status" value={status} icon={ShieldCheck} accent />
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-white/70 border border-slate-100">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Lokasi
                        </span>
                        <span className="text-xs font-black text-emerald-700">✓ TERVERIFIKASI</span>
                    </div>
                </div>
            );
        }

        // DITOLAK
        const isAccuracy = reason === 'GPS_ACCURACY_TOO_LOW';
        const isOutside = reason === 'LOCATION_OUTSIDE_RADIUS';

        return (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-black text-lg text-slate-900">ABSENSI DITOLAK</p>
                        <p className="text-xs text-slate-500">{result.server_date}</p>
                    </div>
                </div>

                <p className="text-xs font-semibold text-slate-700 mb-4">
                    {reason && FAILURE_LABELS[reason]} {result.message}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    {isAccuracy ? (
                        <Detail label="Akurasi GPS" value={`±${Math.round(result.gps_accuracy)} m`} icon={SatelliteDish} />
                    ) : (
                        <Detail label="Jarak ke Perusahaan" value={formatDistance(result.distance_from_company)} icon={MapPin} />
                    )}
                    <Detail
                        label={isOutside ? 'Radius yang Diizinkan' : 'Maksimal Akurasi'}
                        value={isOutside ? `${result.allowed_radius ?? config.defaultRadius} m` : `${config.maxGpsAccuracy} m`}
                        icon={ShieldCheck}
                    />
                    <Detail label="Waktu Server" value={result.server_time} icon={Clock} />
                    <Detail label="Status" value="DITOLAK" icon={XCircle} accent />
                </div>

                {reason === 'ALREADY_ATTENDED' && (
                    <p className="mt-4 text-xs font-bold text-rose-700 text-center">Absensi hari ini sudah tercatat.</p>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{todayDate}</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-1 font-mono">{clock} <span className="text-slate-400 text-lg">WIB</span></h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-600" />
                        <span>
                            {company ? `${company.name} · Radius ${company.allowed_radius ?? config.defaultRadius} m` : 'Belum ditempatkan di perusahaan'}
                        </span>
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {renderAction()}

                {!companyConfigured && !alreadyAttended && (
                    <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                        Koordinat lokasi perusahaan belum dikonfigurasi admin. Absensi belum dapat dilakukan.
                    </p>
                )}

                {phase === 'getting_location' && (
                    <GeoStatusRow icon={<MapPin className="w-4 h-4 animate-pulse text-cyan-600" />} text="Mendeteksi lokasi GPS..." />
                )}
                {phase === 'validating' && (
                    <GeoStatusRow icon={<LocateFixed className="w-4 h-4 text-emerald-600" />} text={`GPS ditemukan (akurasi ±${location ? Math.round(location.accuracy) : '-'} m) — memverifikasi...`} />
                )}
                {phase === 'submitting' && (
                    <GeoStatusRow icon={<Loader2 className="w-4 h-4 animate-spin text-cyan-600" />} text="Menunggu validasi server..." />
                )}
                {phase === 'error' && errorMessage && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-slate-700">{errorMessage}</p>
                    </div>
                )}

                {location && result === null && phase !== 'error' && phase !== 'idle' && (
                    <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-600 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-cyan-600" /> Estimasi jarak (preview)
                        </span>
                        <span className="font-black text-slate-900">{formatDistance(previewDistance)}</span>
                    </div>
                )}

                {renderResult()}
            </div>
        </div>
    );
};

interface DetailProps {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: boolean;
}

const Detail: React.FC<DetailProps> = ({ label, value, icon: Icon, accent }) => (
    <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
        <p className={`mt-1 text-sm font-black ${accent ? 'text-cyan-700' : 'text-slate-900'}`}>{value}</p>
    </div>
);

const GeoStatusRow: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-2 rounded-xl px-4 py-3 bg-cyan-50 border border-cyan-100 text-xs font-semibold text-cyan-800">
        {icon}
        {text}
    </div>
);