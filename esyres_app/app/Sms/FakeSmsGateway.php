<?php

namespace App\Sms;

final class FakeSmsGateway implements SmsGateway
{
    public ?string $lastPhone = null;

    public ?string $lastCode = null;

    public function send(string $phone, string $code): void
    {
        $this->lastPhone = $phone;
        $this->lastCode = $code;
    }

    public function reset(): void
    {
        $this->lastPhone = null;
        $this->lastCode = null;
    }
}
