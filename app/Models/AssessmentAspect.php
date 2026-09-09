<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentAspect extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'max_score',
        'min_score',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'max_score' => 'integer',
        'min_score' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scores(): HasMany
    {
        return $this->hasMany(AssessmentAspectScore::class, 'assessment_aspect_id');
    }
}