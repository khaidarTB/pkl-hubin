<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Smart Geo-Attendance
    |--------------------------------------------------------------------------
    |
    | Konfigurasi absensi geolokasi: batas akurasi GPS, radius default, dan
    | jendela waktu check-in. Semua nilai dinilai ulang oleh server; hasil
    | dari frontend (TypeScript + geolib) tidak pernah dipercaya.
    |
    */

    // Radius default (meter) jika perusahaan tidak mengisi allowed_radius.
    'default_radius' => (int) env('ATTENDANCE_DEFAULT_RADIUS', 100),

    // Akurasi GPS maksimal yang diterima (meter).
    // Nilai di bawah adalah fallback default; admin dapat mengubahnya
    // dari dashboard (Pengaturan Presensi GPS) dan disimpan di tabel settings.
    'max_gps_accuracy' => (int) env('MAX_GPS_ACCURACY', 50),

    /*
     * Jendela waktu check-in masuk (Asia/Jakarta):
     *  - sebelum start          -> OUTSIDE_ATTENDANCE_TIME
     *  - start .. on_time_until -> HADIR
     *  - on_time_until .. end   -> TERLAMBAT
     *  - setelah end            -> OUTSIDE_ATTENDANCE_TIME
     *
     * Bila perusahaan mengisi jam_masuk / jam_keluar sendiri, nilai default
     * berikut hanya dipakai sebagai fallback untuk perusahaan tanpa jam kerja:
     *  - start          = jam_masuk
     *  - on_time_until  = jam_masuk + ATTENDANCE_ON_TIME_GRACE_MINUTES
     *  - end            = jam_keluar
     */
    'check_in_window' => [
        'start' => env('ATTENDANCE_START_AT', '06:30'),
        'on_time_until' => env('ATTENDANCE_ON_TIME_UNTIL', '08:00'),
        'end' => env('ATTENDANCE_END_AT', '09:00'),
    ],

    // Toleransi keterlambatan (menit) sejak jam_masuk perusahaan.
    'on_time_grace_minutes' => (int) env('ATTENDANCE_ON_TIME_GRACE_MINUTES', 30),

];
