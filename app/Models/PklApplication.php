<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PklApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'company_id',
        'pkl_period_id',
        'company_name',
        'company_address',
        'field_of_work',
        'desired_position',
        'cv_file',
        'cover_letter_file',
        'additional_file',
        'status',
        'revision_note',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_REVISION = 'revision';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function period()
    {
        return $this->belongsTo(PklPeriod::class, 'pkl_period_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function placement()
    {
        return $this->hasOne(Placement::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'submitted' => 'Menunggu Verifikasi',
            'under_review' => 'Sedang Direview',
            'revision' => 'Perlu Revisi',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'slate',
            'submitted' => 'amber',
            'under_review' => 'blue',
            'revision' => 'orange',
            'approved' => 'emerald',
            'rejected' => 'red',
            default => 'slate',
        };
    }
}
