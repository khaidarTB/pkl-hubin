<?php

namespace App\Services\Support;

/**
 * Perhitungan jarak geodesik (Haversine) di sisi server.
 * Digunakan untuk memvalidasi ulang koordinat yang dikirim frontend —
 * Laravel adalah source of truth untuk keputusan akhir.
 */
class GeoCalculator
{
    private const EARTH_RADIUS = 6371000; // meter

    /**
     * Jarak dua koordinat dalam meter.
     *
     * @param  float  $lat1
     * @param  float  $lon1
     * @param  float  $lat2
     * @param  float  $lon2
     * @return float
     */
    public static function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS * $c;
    }
}