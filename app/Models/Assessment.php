<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'industry_supervisor_id',
        'discipline',
        'responsibility',
        'teamwork',
        'communication',
        'technical_skill',
        'creativity',
        'problem_solving',
        'total_score',
        'notes',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'industry_supervisor_id');
    }
}
