<?php

namespace App\Services\Support;

final readonly class GeminiResult
{
    private function __construct(
        public bool $ok,
        public ?string $text,
        public ?string $error,
        public ?int $status = null,
    ) {}

    public static function success(string $text): self
    {
        return new self(true, $text, null);
    }

    public static function failure(string $error, ?int $status = null): self
    {
        return new self(false, null, $error, $status);
    }
}
