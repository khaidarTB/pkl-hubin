<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send WhatsApp notification message abstraction.
     * Can be integrated with Fonnte, Wablas, or custom WhatsApp API.
     */
    public function sendNotification(string $phone, string $message): array
    {
        Log::info("WhatsApp Gateway Mock -> Sent to {$phone}: {$message}");

        return [
            'status' => true,
            'gateway' => 'Connected',
            'phone' => $phone,
            'message' => $message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
