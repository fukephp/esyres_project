<?php

namespace App\Sms;

interface SmsGateway
{
    public function send(string $phone, string $code): void;

    public function notify(string $phone, string $body): void;
}
