<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'phone',
        'email',
        'website',
        'industry_type',
        'logo',
        'description',
        'supervisor_name',
        'partnership_status',
        'student_quota',
        'latitude',
        'longitude',
        'allowed_radius',
        'jam_masuk',
        'jam_keluar',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'allowed_radius' => 'integer',
    ];

    public function getJamMasukAttribute(?string $value): ?string
    {
        return $value !== null ? substr($value, 0, 5) : null;
    }

    public function getJamKeluarAttribute(?string $value): ?string
    {
        return $value !== null ? substr($value, 0, 5) : null;
    }

    public function placements()
    {
        return $this->hasMany(Placement::class);
    }

    public function applications()
    {
        return $this->hasMany(PklApplication::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function documentations()
    {
        return $this->hasMany(Documentation::class);
    }

    public function activeStudentsCount(): int
    {
        return $this->placements()->where('status', 'Aktif')->count();
    }
}
