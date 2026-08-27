<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PklPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'academic_year',
        'start_date',
        'end_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function placements()
    {
        return $this->hasMany(Placement::class);
    }

    public function applications()
    {
        return $this->hasMany(PklApplication::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
