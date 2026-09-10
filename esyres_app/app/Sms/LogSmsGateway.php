<?php

namespace App\Sms;

use Illuminate\Support\Facades\Log;

final class LogSmsGateway implements SmsGateway
{
    public function send(string $phone, string $code): void
    {
        Log::info('SMS OTP', ['phone' => $phone, 'code' => $code]);
    }

    public function notify(string $phone, string $body): void
    {
        Log::info('SMS status', ['phone' => $phone, 'body' => $body]);
    }
}
