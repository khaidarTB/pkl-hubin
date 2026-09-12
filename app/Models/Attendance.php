<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'date',
        'check_in',
        'check_out',
        'latitude',
        'longitude',
        'location_address',
        'status',
        'server_timestamp',
        'gps_accuracy',
        'company_latitude',
        'company_longitude',
        'distance_from_company',
        'allowed_radius',
        'location_status',
        'time_status',
        'check_out_server_timestamp',
        'check_out_latitude',
        'check_out_longitude',
        'check_out_gps_accuracy',
        'check_out_distance_from_company',
    ];

    protected function casts(): array
    {
        return [
            'server_timestamp' => 'datetime',
            'check_out_server_timestamp' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'gps_accuracy' => 'float',
            'company_latitude' => 'float',
            'company_longitude' => 'float',
            'distance_from_company' => 'float',
            'allowed_radius' => 'integer',
            'check_out_latitude' => 'float',
            'check_out_longitude' => 'float',
            'check_out_gps_accuracy' => 'float',
            'check_out_distance_from_company' => 'float',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
