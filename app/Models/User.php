<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function schoolPlacements()
    {
        return $this->hasMany(Placement::class, 'school_supervisor_id');
    }

    public function industryPlacements()
    {
        return $this->hasMany(Placement::class, 'industry_supervisor_id');
    }

    public function teacherVisits()
    {
        return $this->hasMany(Visit::class, 'teacher_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isGuru(): bool
    {
        return $this->role === 'guru';
    }

    public function isIndustri(): bool
    {
        return $this->role === 'industri';
    }

    public function isSiswa(): bool
    {
        return $this->role === 'siswa';
    }
}
