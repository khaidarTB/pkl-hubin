import { getDistance } from 'geolib';
import type {
    GPSAcquisitionConfig,
    GPSProgressState,
    GeoValidationCompany,
    LocationSample,
    StudentLocation,
} from '@/Types/attendance';

export type GeolocationErrorCode =
    | 'PERMISSION_DENIED'
    | 'POSITION_UNAVAILABLE'
    | 'TIMEOUT'
    | 'UNSUPPORTED'
    | 'ACCURACY_TOO_POOR';

export class GeolocationError extends Error {
    code: GeolocationErrorCode;

    constructor(code: GeolocationErrorCode, customMessage?: string) {
        super(customMessage || getGeolocationErrorMessage(code));
        this.name = 'GeolocationError';
        this.code = code;
    }
}

export const DEFAULT_GPS_CONFIG: GPSAcquisitionConfig = {
    desiredAccuracy: 15,       // Ideal target: <= 15 meters
    maxAccuracy: 30,           // Maximum acceptable limit: <= 30 meters
    timeout: 15000,            // Watch timeout: 15 seconds max
    requiredStableSamples: 3,  // Number of stable samples needed
    maxSamples: 10,            // Maximum total samples allowed
    maxPositionAge: 5000,      // Max sample age: 5 seconds
    stabilityDistance: 10,     // Max movement allowed between samples: 10 meters
};

/**
 * Pengambilan lokasi berakurasi tinggi & stabil menggunakan watchPosition.
 *
 * Mencegah masalah 'Cold GPS' ketika siswa absen tepat waktu.
 * Multi-sample berkala -> Evaluasi akurasi -> Cek stabilitas perpindahan (geolib) -> Best fix -> clearWatch.
 */
export function acquireStableLocation(
    onProgress?: (state: GPSProgressState) => void,
    customConfig?: Partial<GPSAcquisitionConfig>,
): Promise<StudentLocation> {
    const cfg: GPSAcquisitionConfig = { ...DEFAULT_GPS_CONFIG, ...customConfig };

    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new GeolocationError('UNSUPPORTED'));
            return;
        }

        let watchId: number | null = null;
        let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
        let isFinalized = false;

        const samples: LocationSample[] = [];

        const cleanup = () => {
            isFinalized = true;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            if (timeoutTimer !== null) {
                clearTimeout(timeoutTimer);
                timeoutTimer = null;
            }
        };

        const emitProgress = (
            phase: GPSProgressState['phase'],
            message: string,
            latestSample?: LocationSample,
        ) => {
            if (!onProgress) return;

            const acceptableSamples = samples.filter((s) => s.accuracy <= cfg.maxAccuracy);
            const stableSamples = samples.filter((s) => s.isStable);
            const bestAcc = acceptableSamples.length > 0
                ? Math.min(...acceptableSamples.map((s) => s.accuracy))
                : (latestSample?.accuracy ?? null);

            onProgress({
                phase,
                currentAccuracy: latestSample?.accuracy ?? null,
                bestAccuracy: bestAcc,
                stableSamplesCount: stableSamples.length,
                requiredStableSamples: cfg.requiredStableSamples,
                totalSamplesCount: samples.length,
                message,
                sample: latestSample,
            });
        };

        // Notify initial permission/request state
        emitProgress('requesting_permission', 'Meminta izin & mengaktifkan GPS perangkat...');

        const handleSuccess = (position: GeolocationPosition) => {
            if (isFinalized) return;

            const { latitude, longitude, accuracy } = position.coords;
            const timestamp = position.timestamp || Date.now();

            // Ignore impossible coordinates (0,0)
            if (latitude === 0 && longitude === 0) {
                return;
            }

            const now = Date.now();
            const age = Math.abs(now - timestamp);

            // Calculate movement distance from immediate previous sample
            const previousSample = samples[samples.length - 1];
            let distanceFromPrevious = 0;
            if (previousSample) {
                distanceFromPrevious = getDistance(
                    { latitude: previousSample.latitude, longitude: previousSample.longitude },
                    { latitude, longitude },
                );
            }

            const isAcceptableAccuracy = accuracy <= cfg.maxAccuracy;
            const isDistanceStable = !previousSample || distanceFromPrevious <= cfg.stabilityDistance;
            const isFresh = age <= cfg.maxPositionAge;
            const isStable = isAcceptableAccuracy && isDistanceStable && isFresh;

            const currentSample: LocationSample = {
                latitude,
                longitude,
                accuracy,
                timestamp,
                isStable,
                distanceFromPrevious,
            };

            samples.push(currentSample);

            const stableSamples = samples.filter((s) => s.isStable);
            const acceptableSamples = samples.filter((s) => s.accuracy <= cfg.maxAccuracy);

            // Update UI state based on sample quality
            if (accuracy <= cfg.desiredAccuracy && (stableSamples.length >= 2 || samples.length >= 3)) {
                // High accuracy acquired and stabilized!
                emitProgress('stable', `Lokasi akurat ditemukan (±${Math.round(accuracy)} m)`, currentSample);

                const finalBest = selectBestSample(acceptableSamples.length > 0 ? acceptableSamples : samples);
                cleanup();
                resolve({
                    latitude: finalBest.latitude,
                    longitude: finalBest.longitude,
                    accuracy: finalBest.accuracy,
                });
                return;
            }

            if (stableSamples.length >= cfg.requiredStableSamples) {
                // Required stable sample count reached
                emitProgress('stable', `Koordinat stabil dikunci (±${Math.round(accuracy)} m)`, currentSample);

                const finalBest = selectBestSample(stableSamples);
                cleanup();
                resolve({
                    latitude: finalBest.latitude,
                    longitude: finalBest.longitude,
                    accuracy: finalBest.accuracy,
                });
                return;
            }

            if (samples.length >= cfg.maxSamples) {
                // Max samples limit reached -> take the best available if within acceptable threshold
                if (acceptableSamples.length > 0) {
                    const finalBest = selectBestSample(acceptableSamples);
                    emitProgress('stable', `Lokasi terbaik dipilih (±${Math.round(finalBest.accuracy)} m)`, finalBest);
                    cleanup();
                    resolve({
                        latitude: finalBest.latitude,
                        longitude: finalBest.longitude,
                        accuracy: finalBest.accuracy,
                    });
                } else {
                    const bestAttempt = selectBestSample(samples);
                    cleanup();
                    reject(
                        new GeolocationError(
                            'ACCURACY_TOO_POOR',
                            `Akurasi GPS (±${Math.round(bestAttempt.accuracy)} m) melebihi batas maksimal ${cfg.maxAccuracy} m. Silakan coba di area terbuka.`,
                        ),
                    );
                }
                return;
            }

            // Still improving signal
            if (!isAcceptableAccuracy) {
                emitProgress(
                    'improving',
                    `Meningkatkan akurasi GPS: ±${Math.round(accuracy)} m (Target: <= ${cfg.maxAccuracy} m)...`,
                    currentSample,
                );
            } else {
                emitProgress(
                    'improving',
                    `Mengecek kestabilan lokasi: ±${Math.round(accuracy)} m (Sampel ${stableSamples.length}/${cfg.requiredStableSamples})...`,
                    currentSample,
                );
            }
        };

        const handleError = (error: GeolocationPositionError) => {
            if (isFinalized) return;

            cleanup();
            const code: GeolocationErrorCode =
                error.code === error.PERMISSION_DENIED
                    ? 'PERMISSION_DENIED'
                    : error.code === error.POSITION_UNAVAILABLE
                      ? 'POSITION_UNAVAILABLE'
                      : 'TIMEOUT';

            reject(new GeolocationError(code));
        };

        // Set overall timeout
        timeoutTimer = setTimeout(() => {
            if (isFinalized) return;

            const acceptableSamples = samples.filter((s) => s.accuracy <= cfg.maxAccuracy);

            if (acceptableSamples.length > 0) {
                const finalBest = selectBestSample(acceptableSamples);
                emitProgress('stable', `Waktu pencarian habis. Lokasi terbaik digunakan (±${Math.round(finalBest.accuracy)} m)`, finalBest);
                cleanup();
                resolve({
                    latitude: finalBest.latitude,
                    longitude: finalBest.longitude,
                    accuracy: finalBest.accuracy,
                });
            } else if (samples.length > 0) {
                const bestAttempt = selectBestSample(samples);
                cleanup();
                reject(
                    new GeolocationError(
                        'ACCURACY_TOO_POOR',
                        `Waktu habis. Akurasi GPS terkini (±${Math.round(bestAttempt.accuracy)} m) belum mencukupi batas ${cfg.maxAccuracy} m.`,
                    ),
                );
            } else {
                cleanup();
                reject(new GeolocationError('TIMEOUT'));
            }
        }, cfg.timeout);

        // Start watchPosition
        try {
            emitProgress('searching', 'Mencari sinyal GPS...');
            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: cfg.timeout,
            });
        } catch {
            cleanup();
            reject(new GeolocationError('POSITION_UNAVAILABLE'));
        }
    });
}

function selectBestSample(sampleList: LocationSample[]): LocationSample {
    return sampleList.reduce((best, cur) => (cur.accuracy < best.accuracy ? cur : best), sampleList[0]);
}

/**
 * Helper compatibility untuk mengambil lokasi siswa.
 */
export function getCurrentLocation(): Promise<StudentLocation> {
    return acquireStableLocation();
}

export function getGeolocationErrorMessage(code: GeolocationErrorCode): string {
    switch (code) {
        case 'PERMISSION_DENIED':
            return 'Izin lokasi ditolak. Izinkan akses lokasi di pengaturan browser peramban Anda.';
        case 'POSITION_UNAVAILABLE':
            return 'Sinyal GPS tidak tersedia. Pastikan fitur Lokasi / GPS perangkat diaktifkan.';
        case 'TIMEOUT':
            return 'Waktu pengambilan sinyal GPS habis. Silakan coba kembali di area terbuka.';
        case 'UNSUPPORTED':
            return 'Perangkat atau browser Anda tidak mendukung Geolocation API.';
        case 'ACCURACY_TOO_POOR':
            return 'Akurasi GPS belum cukup baik. Tunggu beberapa detik atau aktifkan GPS perakitan.';
        default:
            return 'Gagal mendapatkan lokasi GPS.';
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