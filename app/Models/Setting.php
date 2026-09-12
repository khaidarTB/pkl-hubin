<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Penyimpanan pengaturan dinamis (key-value).
 *
 * Pengaturan berbasis .env tidak bisa diubah dari UI. Settings memungkinkan
 * admin mengubah nilai tertentu (mis. batas akurasi GPS) secara langsung
 * dari dashboard, dengan fallback ke config/attendance.php bila key belum ada.
 */
class Setting extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = ['key', 'value'];

    private static array $cache = [];

    /**
     * Ambil nilai pengaturan. Bila key belum tersimpan, kembalikan $default.
     * Nilai di-cache per request agar query hanya dilakukan sekali.
     */
    public static function get(string $key, $default = null): mixed
    {
        if (array_key_exists($key, self::$cache)) {
            return self::$cache[$key];
        }

        $setting = Cache::remember(
            'setting.'.$key,
            now()->addMinutes(5),
            fn () => self::query()->where('key', $key)->value('value')
        );

        return self::$cache[$key] = $setting !== null ? $setting : $default;
    }

    /**
     * Simpan (atau perbarui) nilai pengaturan dan bersihkan cache terkait.
     */
    public static function set(string $key, mixed $value): void
    {
        self::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);

        Cache::forget('setting.'.$key);
        unset(self::$cache[$key]);
    }
}