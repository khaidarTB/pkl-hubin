import { getDistance } from 'geolib';
import type { GeoValidationCompany, StudentLocation } from '@/Types/attendance';

export type GeolocationErrorCode =
    | 'PERMISSION_DENIED'
    | 'POSITION_UNAVAILABLE'
    | 'TIMEOUT'
    | 'UNSUPPORTED';

export class GeolocationError extends Error {
    code: GeolocationErrorCode;

    constructor(code: GeolocationErrorCode) {
        super(getGeolocationErrorMessage(code));
        this.name = 'GeolocationError';
        this.code = code;
    }
}

const POSITION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
};

/**
 * Mendapatkan lokasi siswa saat ini melalui Geolocation API.
 * Pemisahan logika GPS dari UI: permission, acquisition, timeout & error
 * ditangani di sini.
 */
export function getCurrentLocation(): Promise<StudentLocation> {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new GeolocationError('UNSUPPORTED'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                const code: GeolocationErrorCode =
                    error.code === error.PERMISSION_DENIED
                        ? 'PERMISSION_DENIED'
                        : error.code === error.POSITION_UNAVAILABLE
                          ? 'POSITION_UNAVAILABLE'
                          : 'TIMEOUT';

                reject(new GeolocationError(code));
            },
            POSITION_OPTIONS,
        );
    });
}

export function getGeolocationErrorMessage(code: GeolocationErrorCode): string {
    switch (code) {
        case 'PERMISSION_DENIED':
            return 'Izin lokasi diperlukan untuk melakukan absensi.';
        case 'POSITION_UNAVAILABLE':
            return 'Lokasi tidak dapat ditemukan. Pastikan GPS aktif.';
        case 'TIMEOUT':
            return 'Pengambilan lokasi terlalu lama. Coba kembali.';
        case 'UNSUPPORTED':
            return 'Perangkat Anda tidak mendukung Geolocation.';
        default:
            return 'Gagal mendapatkan lokasi.';
    }
}

/**
 * Estimasi jarak (meter) antara siswa dan perusahaan.
 * HANYA untuk preview UI — keputusan akhir dihitung ulang oleh server.
 */
export function estimateDistance(location: StudentLocation, company: GeoValidationCompany | null): number | null {
    if (!company?.latitude || !company.longitude) {
        return null;
    }

    return getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: company.latitude, longitude: company.longitude },
    );
}

/** Format jarak: 43 m / 2,40 km. */
export function formatDistance(meters: number | null | undefined): string {
    if (meters === null || meters === undefined || Number.isNaN(meters)) {
        return '-';
    }

    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2).replace('.', ',')} km`;
    }

    return `${Math.round(meters)} m`;
}