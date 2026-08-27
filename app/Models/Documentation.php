<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Documentation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'caption',
        'company_id',
        'student_id',
        'visit_id',
        'photo_path',
        'category',
        'date',
        'is_approved',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_approved' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
