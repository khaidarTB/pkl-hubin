import type { Attendance } from '@/Types';

/**
 * Tipe data Smart Geo-Attendance.
 *
 * Catatan: frontend (TypeScript + geolib) hanya mengumpulkan koordinat GPS
 * dan menampilkan estimasi. Keputusan akhir (status, jarak, waktu) dilakukan
 * oleh server Laravel — nilai di bawah hanya untuk UI/preview.
 */
export interface StudentLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export type AttendanceResultStatus = 'HADIR' | 'TERLAMBAT' | 'DITOLAK';

export type AttendanceFailureReason =
    | 'LOCATION_OUTSIDE_RADIUS'
    | 'GPS_ACCURACY_TOO_LOW'
    | 'OUTSIDE_ATTENDANCE_TIME'
    | 'STUDENT_NOT_ASSIGNED_TO_COMPANY'
    | 'COMPANY_LOCATION_NOT_CONFIGURED'
    | 'ALREADY_ATTENDED'
    | 'NOT_CHECKED_IN'
    | 'ALREADY_CHECKED_OUT';

export type GeoLocationStatus =
    | 'VERIFIED'
    | 'REJECTED'
    | 'OUTSIDE_RADIUS'
    | 'LOW_ACCURACY'
    | null;

export type GeoTimeStatus = 'ON_TIME' | 'LATE' | 'OUTSIDE_WORKING_HOURS' | null;

export type GeoAttendanceAction = 'CHECK_IN' | 'CHECK_OUT' | null;

export type GeoAttendancePhase =
    | 'idle'
    | 'requesting_permission'
    | 'searching'
    | 'improving'
    | 'stable'
    | 'getting_location'
    | 'validating'
    | 'submitting'
    | 'success'
    | 'error';

export interface GPSAcquisitionConfig {
    desiredAccuracy: number;       // Ideal target accuracy in meters (e.g. 15m)
    maxAccuracy: number;           // Upper limit of acceptable accuracy in meters (e.g. 30m)
    timeout: number;               // Maximum time to watch GPS in milliseconds (e.g. 15000ms)
    requiredStableSamples: number; // Number of stable samples required (e.g. 3)
    maxSamples: number;            // Maximum number of total samples before selecting best (e.g. 10)
    maxPositionAge: number;        // Maximum age of position sample in milliseconds (e.g. 5000ms)
    stabilityDistance: number;     // Maximum movement distance between samples in meters (e.g. 10m)
}

export interface LocationSample extends StudentLocation {
    timestamp: number;
    isStable?: boolean;
    distanceFromPrevious?: number;
}

export interface GPSProgressState {
    phase: GeoAttendancePhase;
    currentAccuracy: number | null;
    bestAccuracy: number | null;
    stableSamplesCount: number;
    requiredStableSamples: number;
    totalSamplesCount: number;
    message: string;
    sample?: LocationSample;
}

export interface GeoValidationCompany {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    allowed_radius: number | null;
    jam_masuk?: string | null;
    jam_keluar?: string | null;
}

/** Hasil final yang dihitung & divalidasi oleh server (Laravel). */
export interface GeoAttendanceResult {
    status: AttendanceResultStatus;
    failure_reason: AttendanceFailureReason | null;
    message: string;
    attendance: Attendance | null;
    server_date: string;
    server_time: string;
    server_timestamp: string;
    latitude: number;
    longitude: number;
    gps_accuracy: number;
    company: GeoValidationCompany | null;
    company_latitude: number | null;
    company_longitude: number | null;
    distance_from_company: number | null;
    allowed_radius: number | null;
    location_status: GeoLocationStatus;
    time_status: GeoTimeStatus;
    action?: GeoAttendanceAction;
    code?: string | null;
    success?: boolean;
}

export interface GeoAttendanceConfig {
    maxGpsAccuracy: number;
    defaultRadius: number;
    onTimeGraceMinutes: number;
    window: {
        start: string;
        on_time_until: string;
        end: string;
    };
}

/** Hasil submit: membedakan kegagalan validasi server vs error jaringan. */
export type SubmitGeoResult =
    | { ok: true; result: GeoAttendanceResult }
    | { ok: false; reason: 'REJECTED'; result: GeoAttendanceResult }
    | { ok: false; reason: 'NETWORK'; message: string };