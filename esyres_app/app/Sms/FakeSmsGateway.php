<?php

namespace App\Sms;

final class FakeSmsGateway implements SmsGateway
{
    public ?string $lastPhone = null;

    public ?string $lastCode = null;

    public ?string $lastStatusPhone = null;

    public ?string $lastStatusBody = null;

    public function send(string $phone, string $code): void
    {
        $this->lastPhone = $phone;
        $this->lastCode = $code;
    }

    public function notify(string $phone, string $body): void
    {
        $this->lastStatusPhone = $phone;
        $this->lastStatusBody = $body;
    }

    public function reset(): void
    {
        $this->lastPhone = null;
        $this->lastCode = null;
        $this->lastStatusPhone = null;
        $this->lastStatusBody = null;
    }
}
