<?php

namespace Database\Seeders;

use App\Models\DocumentVerification;
use App\Models\DocumentVerificationLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DocumentVerificationLogSeeder extends Seeder
{
    public function run(): void
    {
        DocumentVerificationLog::query()->delete();

        $validVerifications = DocumentVerification::where('status', 'VALID')->get();

        $ipAddresses = [
            '103.130.11.201',
            '36.84.201.150',
            '114.5.156.110',
            '125.160.120.65',
            '103.176.221.180',
            '182.253.109.220',
        ];

        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        ];

        foreach ($validVerifications as $verification) {
            // Setiap verifikasi di-scan 1-3 kali
            $scanCount = rand(1, 3);
            for ($i = 0; $i < $scanCount; $i++) {
                DocumentVerificationLog::create([
                    'document_verification_id' => $verification->id,
                    'verified_at' => $verification->verified_at ? $verification->verified_at->copy()->addDays(rand(0, 2))->addHours(rand(0, 23)) : now()->subDays(rand(1, 7)),
                    'ip_address' => $ipAddresses[rand(0, count($ipAddresses) - 1)],
                    'user_agent' => $userAgents[rand(0, count($userAgents) - 1)],
                ]);
            }
        }
    }
}
