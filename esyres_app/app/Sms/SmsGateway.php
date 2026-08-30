<?php

namespace App\Sms;

interface SmsGateway
{
    public function send(string $phone, string $code): void;
}
