import axios from 'axios';
import type { GeoAttendanceResult, StudentLocation, SubmitGeoResult } from '@/Types/attendance';

/**
 * Mengirim koordinat mentah ke server untuk validasi FINAL.
 *
 * Yang dikirim HANYA latitude, longitude, accuracy. Server Laravel-lah yang
 * menentukan jarak, status (HADIR/TERLAMBAT/DITOLAK), dan waktu (server
 * timestamp) — semua nilai tersebut TIDAK pernah diterima dari client.
 */
export async function submitGeoAttendance(location: StudentLocation): Promise<SubmitGeoResult> {
    try {
        const { data } = await axios.post<GeoAttendanceResult>('/absensi/geo-checkin', location);

        return { ok: true, result: data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const payload = error.response?.data as GeoAttendanceResult | undefined;

            // Penolakan server yang valid (status DITOLAK) — dikembalikan sebagai hasil,
            // bukan error jaringan, agar UI bisa menampilkan alasan spesifik.
            if (payload?.status === 'DITOLAK') {
                return { ok: false, reason: 'REJECTED', result: payload };
            }

            return {
                ok: false,
                reason: 'NETWORK',
                message:
                    error.response?.status === 422
                        ? 'Data lokasi tidak valid. Silakan coba kembali.'
                        : 'Gagal terhubung ke server. Periksa koneksi Anda.',
            };
        }

        return { ok: false, reason: 'NETWORK', message: 'Terjadi kesalahan yang tidak diketahui.' };
    }
}