<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'verification_code',
        'verification_token',
        'document_type',
        'document_number',
        'status',
        'verified_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function logs()
    {
        return $this->hasMany(DocumentVerificationLog::class, 'document_verification_id');
    }

    /**
     * Konten QR Code pada surat: identitas dokumen + nama penanda tangan
     * + URL verifikasi ber-token. Isi surat sensitif tidak disimpan di sini.
     */
    public function buildQrPayload(): string
    {
        $data = $this->document?->data ?? [];

        $lines = [
            'PKLConnect - Digital Document Verification',
            'Verification ID: ' . $this->verification_code,
            'Nomor Surat: ' . $this->document_number,
            'Ditandatangani oleh: ' . ($data['nama_guru'] ?? '-'),
            'NIP. ' . ($data['nip'] ?? '-'),
        ];

        if (!empty($data['nama_siswa'])) {
            $lines[] = 'Siswa: ' . $data['nama_siswa'];
        }

        $lines[] = 'Verifikasi keaslian dokumen:';
        $lines[] = url('/verify/' . $this->verification_token);

        return implode("\n", $lines);
    }
}
