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
    | 'ALREADY_ATTENDED';

export type GeoLocationStatus = 'VERIFIED' | 'REJECTED' | null;

export type GeoTimeStatus = 'ON_TIME' | 'LATE' | null;

export type GeoAttendancePhase =
    | 'idle'
    | 'getting_location'
    | 'validating'
    | 'submitting'
    | 'success'
    | 'error';

export interface GeoValidationCompany {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    allowed_radius: number | null;
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
}

export interface GeoAttendanceConfig {
    maxGpsAccuracy: number;
    defaultRadius: number;
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