<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nis',
        'class',
        'major',
        'phone',
        'photo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function placement()
    {
        return $this->hasOne(Placement::class);
    }

    public function applications()
    {
        return $this->hasMany(PklApplication::class);
    }

    public function latestApplication()
    {
        return $this->hasOne(PklApplication::class)->latestOfMany();
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function journals()
    {
        return $this->hasMany(Journal::class);
    }

    public function assessment()
    {
        return $this->hasOne(Assessment::class);
    }
}
