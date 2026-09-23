<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PklExtension extends Model
{
    use HasFactory;

    protected $fillable = [
        'placement_id',
        'student_id',
        'requested_by',
        'requester_role',
        'old_start_date',
        'old_end_date',
        'requested_start_date',
        'requested_end_date',
        'reason',
        'extension_letter_path',
        'extension_letter_original_name',
        'extension_letter_mime',
        'extension_letter_size',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_feedback',
    ];

    protected function casts(): array
    {
        return [
            'old_start_date' => 'date',
            'old_end_date' => 'date',
            'requested_start_date' => 'date',
            'requested_end_date' => 'date',
            'reviewed_at' => 'datetime',
            'extension_letter_size' => 'integer',
        ];
    }

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    // Relationships

    public function placement()
    {
        return $this->belongsTo(Placement::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Accessors

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu Review',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'cancelled' => 'Dibatalkan',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'amber',
            'approved' => 'emerald',
            'rejected' => 'red',
            'cancelled' => 'slate',
            default => 'slate',
        };
    }

    // Scopes

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Check if this extension overlaps with another approved/pending extension
     * for the same placement.
     */
    public function scopeOverlappingWith($query, $placementId, $startDate, $endDate, $excludeId = null)
    {
        return $query->where('placement_id', $placementId)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_APPROVED])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where(function ($inner) use ($startDate, $endDate) {
                    $inner->where('requested_start_date', '<=', $endDate)
                          ->where('requested_end_date', '>=', $startDate);
                });
            })
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId));
    }
}
