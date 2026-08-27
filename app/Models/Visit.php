<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'student_id',
        'company_id',
        'placement_id',
        'visit_date',
        'visit_time',
        'purpose',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
        ];
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function placement()
    {
        return $this->belongsTo(Placement::class);
    }

    public function report()
    {
        return $this->hasOne(VisitReport::class);
    }

    public function document()
    {
        return $this->hasOne(Document::class);
    }
}
