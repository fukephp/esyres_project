<?php

namespace App\Jobs;

use App\Sms\SmsGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendPhoneOtp implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $phone,
        public string $code,
    ) {}

    public function handle(SmsGateway $sms): void
    {
        $sms->send($this->phone, $this->code);
    }
}
