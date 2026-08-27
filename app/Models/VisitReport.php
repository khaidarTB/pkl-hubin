<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'student_condition',
        'attendance_status',
        'progress_notes',
        'obstacles',
        'industry_feedback',
        'recommendations',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }
}
