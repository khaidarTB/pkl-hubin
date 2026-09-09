<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentVerification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DocumentVerificationSeeder extends Seeder
{
    public function run(): void
    {
        DocumentVerification::query()->delete();

        $finalDocuments = Document::where('status', 'final')->get();

        foreach ($finalDocuments as $index => $document) {
            DocumentVerification::create([
                'document_id' => $document->id,
                'verification_code' => 'PKL-2026-' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT),
                'verification_token' => 'verify-' . Str::random(32),
                'document_type' => $document->type,
                'document_number' => $document->document_number,
                'status' => $index % 6 === 5 ? 'REVOKED' : 'VALID',
                'verified_at' => $index % 6 === 5 ? null : now()->subDays(rand(1, 10)),
                'revoked_at' => $index % 6 === 5 ? now()->subDays(rand(1, 5)) : null,
            ]);
        }
    }
}
