<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'company_id',
        'server_timestamp',
        'latitude',
        'longitude',
        'gps_accuracy',
        'company_latitude',
        'company_longitude',
        'distance_from_company',
        'allowed_radius',
        'result',
        'failure_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'server_timestamp' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'gps_accuracy' => 'float',
            'company_latitude' => 'float',
            'company_longitude' => 'float',
            'distance_from_company' => 'float',
            'allowed_radius' => 'integer',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}