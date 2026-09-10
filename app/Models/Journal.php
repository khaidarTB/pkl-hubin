<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'date',
        'activity',
        'description',
        'skill',
        'obstacle',
        'solution',
        'status',
        'approved_by',
        'approved_at',
        'approved_signature',
        'revision_note',
    ];

    protected $appends = ['approved_signature_url'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getApprovedSignatureUrlAttribute()
    {
        return $this->approved_signature
            ? Storage::disk('public')->url($this->approved_signature)
            : null;
    }
}
