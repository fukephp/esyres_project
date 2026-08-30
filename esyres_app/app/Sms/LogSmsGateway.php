<?php

namespace App\Sms;

use Illuminate\Support\Facades\Log;

final class LogSmsGateway implements SmsGateway
{
    public function send(string $phone, string $code): void
    {
        Log::info('SMS OTP', ['phone' => $phone, 'code' => $code]);
    }
}
