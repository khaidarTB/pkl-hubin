<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentVerificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_verification_id',
        'verified_at',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function verification()
    {
        return $this->belongsTo(DocumentVerification::class, 'document_verification_id');
    }
}
