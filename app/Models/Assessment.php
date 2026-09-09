<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'status',
        'notes',
    ];

    protected $casts = [
        'total_score' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'industry_supervisor_id');
    }

    public function aspectScores(): HasMany
    {
        return $this->hasMany(AssessmentAspectScore::class);
    }
}
