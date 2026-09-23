import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    LocateFixed,
    LogOut,
    MapPin,
    Navigation,
    RotateCcw,
    SatelliteDish,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import type { Attendance } from '@/Types';
import type {
    AttendanceFailureReason,
    AttendanceResultStatus,
    GPSProgressState,
    GeoAttendanceConfig,
    GeoAttendancePhase,
    GeoAttendanceResult,
    GeoValidationCompany,
    StudentLocation,
} from '@/Types/attendance';
import { acquireStableLocation, estimateDistance, formatDistance } from '@/services/geolocation';
import { submitGeoAttendance, submitGeoCheckOut } from '@/services/attendance';

interface Props {
    company: GeoValidationCompany | null;
    todayAttendance: Attendance | null;
    todayDate: string;
    initialTime: string;
    config: GeoAttendanceConfig;
}

type GeoMode = 'check_in' | 'check_out';

const FAILURE_LABELS: Record<AttendanceFailureReason, string> = {
    LOCATION_OUTSIDE_RADIUS: 'Anda berada di luar radius lokasi PKL.',
    GPS_ACCURACY_TOO_LOW: 'Akurasi GPS belum cukup baik.',
    OUTSIDE_ATTENDANCE_TIME: 'Di luar jendela waktu absensi.',
    STUDENT_NOT_ASSIGNED_TO_COMPANY: 'Anda tidak memiliki penempatan PKL aktif.',
    COMPANY_LOCATION_NOT_CONFIGURED: 'Koordinat perusahaan belum dikonfigurasi admin.',
    ALREADY_ATTENDED: 'Absensi hari ini sudah tercatat.',
    NOT_CHECKED_IN: 'Anda belum melakukan check-in hari ini.',
    ALREADY_CHECKED_OUT: 'Anda sudah melakukan check-out hari ini.',
};

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

function minutesToTime(total: number): string {
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const SmartGeoAttendance: React.FC<Props> = ({
    company,
    todayAttendance,
    todayDate,
    initialTime,
    config,
}) => {
    const [phase, setPhase] = useState<GeoAttendancePhase>('idle');
    const [mode, setMode] = useState<GeoMode>('check_in');
    const [location, setLocation] = useState<StudentLocation | null>(null);
    const [progressState, setProgressState] = useState<GPSProgressState | null>(null);
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

    const busy =
        phase === 'requesting_permission' ||
        phase === 'searching' ||
        phase === 'improving' ||
        phase === 'stable' ||
        phase === 'getting_location' ||
        phase === 'validating' ||
        phase === 'submitting';

    const alreadyAttended = Boolean(todayAttendance?.check_in);
    const alreadyCheckedOut = Boolean(todayAttendance?.check_out);
    const companyConfigured = Boolean(company?.latitude && company.longitude);

    const radius = company?.allowed_radius ?? config.defaultRadius;

    // Jendela waktu efektif: mengikuti jam kerja perusahaan bila terisi.
    const effectiveWindow = useMemo(() => {
        const w = config.window;
        const jamMasuk = company?.jam_masuk;
        const jamKeluar = company?.jam_keluar;
        const start = jamMasuk || w.start;
        const onTimeUntil = jamMasuk
            ? minutesToTime(toMinutes(start) + config.onTimeGraceMinutes)
            : w.on_time_until;
        const end = jamKeluar || w.end;

        return { start, onTimeUntil, end };
    }, [company, config]);

    const previewDistance = useMemo(
        () => (location && company && companyConfigured ? estimateDistance(location, company) : null),
        [location, company, companyConfigured],
    );

    const previewTimeStatus = useMemo(() => {
        if (!location) {
            return null;
        }
        const nowMin = toMinutes(clock);
        const start = toMinutes(effectiveWindow.start);
        const onTime = toMinutes(effectiveWindow.onTimeUntil);
        const end = toMinutes(effectiveWindow.end);

        if (nowMin < start || nowMin > end) {
            return { label: 'Di luar jam kerja', tone: 'danger' as const };
        }
        return nowMin <= onTime
            ? { label: 'Tepat waktu', tone: 'ok' as const }
            : { label: 'Terlambat', tone: 'warn' as const };
    }, [location, clock, effectiveWindow]);

    const previewLocationStatus = useMemo(() => {
        if (previewDistance === null) {
            return null;
        }
        const inside = previewDistance <= radius;
        return {
            label: inside ? 'Di dalam radius' : 'Di luar radius',
            tone: inside ? ('ok' as const) : ('danger' as const),
        };
    }, [previewDistance, radius]);

    const accuracyOk = location ? location.accuracy <= config.maxGpsAccuracy : true;

    const handleRun = async (runMode: GeoMode) => {
        if (busy) {
            return;
        }
        if (runMode === 'check_in' && (alreadyAttended || !companyConfigured)) {
            return;
        }
        if (runMode === 'check_out' && !alreadyAttended) {
            return;
        }

        setMode(runMode);
        setResult(null);
        setErrorMessage(null);
        setLocation(null);
        setProgressState(null);
        setPhase('requesting_permission');

        let loc: StudentLocation;
        try {
            loc = await acquireStableLocation(
                (progress) => {
                    setPhase(progress.phase);
                    setProgressState(progress);
                    if (progress.sample) {
                        setLocation(progress.sample);
                    }
                },
                {
                    maxAccuracy: config.maxGpsAccuracy || 30,
                },
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Gagal mendapatkan lokasi GPS.');
            setPhase('error');
            return;
        }

        setLocation(loc);
        setPhase('validating');
        await delay(1000);
        setPhase('submitting');

        const submission = runMode === 'check_in'
            ? await submitGeoAttendance(loc)
            : await submitGeoCheckOut(loc);

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

    const renderPreview = () => {
        if (phase !== 'validating' && phase !== 'submitting') {
            return null;
        }
        if (!location) {
            return null;
        }

        const locTone = previewLocationStatus?.tone ?? 'warn';
        const timeTone = previewTimeStatus?.tone ?? 'warn';
        const accTone = accuracyOk ? 'ok' : 'danger';

        return (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs">
                <p className="font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <SatelliteDish className="w-4 h-4 text-cyan-600" /> Status Lokasi Sebelum Absen
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <PreviewItem label="GPS Accuracy" value={`±${Math.round(location.accuracy)} m`} tone={accTone} />
                    <PreviewItem label="Jarak Ke Tempat PKL" value={formatDistance(previewDistance)} tone={previewLocationStatus === null ? 'warn' : locTone} />
                    <PreviewItem label="Radius Diizinkan" value={`${radius} m`} tone="neutral" />
                    <PreviewItem label="Status Lokasi" value={previewLocationStatus?.label ?? '—'} tone={previewLocationStatus === null ? 'warn' : locTone} />
                    <PreviewItem label="Estimasi Status" value={previewTimeStatus?.label ?? '—'} tone={previewTimeStatus === null ? 'warn' : timeTone} />
                    <div className="p-2 rounded-lg bg-white/80 border border-slate-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Jam Kerja</span>
                        <p className="mt-0.5 font-black text-slate-900">
                            {effectiveWindow.start}–{effectiveWindow.end}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderAction = () => {
        if (phase === 'success') {
            return null;
        }

        if (alreadyCheckedOut) {
            return (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <p className="font-extrabold text-sm">Absensi Hari Ini Lengkap</p>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                        Check-in pukul <span className="font-bold">{todayAttendance?.check_in} WIB</span>
                        <span> · </span>
                        Check-out pukul <span className="font-bold">{todayAttendance?.check_out} WIB</span>
                    </p>
                </div>
            );
        }

        if (alreadyAttended) {
            return (
                <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                            <p className="font-extrabold text-sm">Sudah check-in pukul <span className="font-bold">{todayAttendance?.check_in} WIB</span></p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRun('check_out')}
                        disabled={busy}
                        className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {busy ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> {progressState?.message || 'Memproses lokasi...'}
                            </>
                        ) : (
                            <>
                                <LogOut className="w-5 h-5" /> ABSEN PULANG
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <button
                type="button"
                onClick={() => handleRun('check_in')}
                disabled={busy || !companyConfigured}
                className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {busy ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> {progressState?.message || 'Memproses lokasi...'}
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
        const isCheckOut = result.action === 'CHECK_OUT';

        if (status === 'HADIR' || status === 'TERLAMBAT') {
            if (isCheckOut) {
                return (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-black text-lg text-slate-900">CHECK-OUT BERHASIL</p>
                                <p className="text-xs text-slate-500">{result.server_date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <Detail label="Waktu Server" value={result.server_time} icon={Clock} />
                            <Detail label="Jarak ke Perusahaan" value={formatDistance(result.distance_from_company)} icon={MapPin} />
                            <Detail label="GPS Accuracy" value={`±${Math.round(result.gps_accuracy)} m`} icon={SatelliteDish} />
                            <Detail label="Status" value="HADIR" icon={ShieldCheck} accent />
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-white/70 border border-slate-100">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Lokasi
                            </span>
                            <span className="text-xs font-black text-emerald-700">✓ TERVERIFIKASI STABIL</span>
                        </div>
                    </div>
                );
            }

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
                        <Detail label="Waktu Server" value={result.server_time} icon={Clock} />
                        <Detail label="Jarak ke Perusahaan" value={formatDistance(result.distance_from_company)} icon={MapPin} />
                        <Detail label="GPS Accuracy" value={`±${Math.round(result.gps_accuracy)} m`} icon={SatelliteDish} />
                        <Detail label="Status" value={status} icon={ShieldCheck} accent />
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-white/70 border border-slate-100">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Lokasi
                        </span>
                        <span className="text-xs font-black text-emerald-700">✓ TERVERIFIKASI STABIL</span>
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
                            {company
                                ? `${company.name} · Radius ${company?.allowed_radius ?? config.defaultRadius} m · Jam ${effectiveWindow.start}–${effectiveWindow.end}`
                                : 'Belum ditempatkan di perusahaan'}
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

                {/* Progress Indicators for GPS Watch & Stabilization */}
                {phase === 'requesting_permission' && (
                    <GeoStatusRow icon={<MapPin className="w-4 h-4 animate-pulse text-cyan-600" />} text={progressState?.message || "Meminta izin lokasi perangkat..."} />
                )}
                {phase === 'searching' && (
                    <GeoStatusRow icon={<SatelliteDish className="w-4 h-4 animate-spin text-cyan-600" />} text={progressState?.message || "Mencari sinyal GPS..."} />
                )}
                {phase === 'improving' && (
                    <GeoStatusRow
                        icon={<LocateFixed className="w-4 h-4 animate-pulse text-amber-600" />}
                        text={progressState?.message || `Meningkatkan akurasi lokasi (±${location ? Math.round(location.accuracy) : '-'} m)...`}
                    />
                )}
                {phase === 'stable' && (
                    <GeoStatusRow
                        icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        text={progressState?.message || `Lokasi stabil terkunci (±${location ? Math.round(location.accuracy) : '-'} m)`}
                    />
                )}
                {phase === 'getting_location' && (
                    <GeoStatusRow icon={<MapPin className="w-4 h-4 animate-pulse text-cyan-600" />} text="Mendeteksi lokasi GPS..." />
                )}
                {phase === 'validating' && (
                    <GeoStatusRow icon={<LocateFixed className="w-4 h-4 text-emerald-600" />} text={`GPS terverifikasi (akurasi ±${location ? Math.round(location.accuracy) : '-'} m) — menyiapkan absensi...`} />
                )}
                {phase === 'submitting' && (
                    <GeoStatusRow icon={<Loader2 className="w-4 h-4 animate-spin text-cyan-600" />} text="Menunggu validasi akhir dari server Laravel..." />
                )}

                {/* Error Banner with Retry Button */}
                {phase === 'error' && errorMessage && (
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-rose-900">Kendala GPS / Lokasi</p>
                                <p className="text-xs font-medium text-rose-700">{errorMessage}</p>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => handleRun(mode)}
                                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Ambil Lokasi Ulang
                            </button>
                        </div>
                    </div>
                )}

                {renderPreview()}

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

interface PreviewItemProps {
    label: string;
    value: string;
    tone: 'ok' | 'warn' | 'danger' | 'neutral';
}

const PreviewItem: React.FC<PreviewItemProps> = ({ label, value, tone }) => {
    const toneClass =
        tone === 'ok'
            ? 'text-emerald-700'
            : tone === 'warn'
              ? 'text-amber-700'
              : tone === 'danger'
                ? 'text-rose-700'
                : 'text-slate-900';

    return (
        <div className="p-2 rounded-lg bg-white/80 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <p className={`mt-0.5 font-black ${toneClass}`}>{value}</p>
        </div>
    );
};