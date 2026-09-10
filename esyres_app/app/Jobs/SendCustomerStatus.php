<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Models\PushSubscription;
use App\Push\CustomerStatus;
use App\Push\PushGateway;
use App\Sms\SmsGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendCustomerStatus implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $bookingId,
        public string $type,
    ) {}

    public function handle(PushGateway $push, SmsGateway $sms): void
    {
        $booking = Booking::query()->with(['salon', 'customer'])->find($this->bookingId);
        if ($booking === null || $booking->customer === null || $booking->salon === null) {
            return;
        }
        $customer = $booking->customer;
        $salon = $booking->salon;
        $title = CustomerStatus::title($this->type);
        $payload = [
            'salonId' => (string) $salon->id,
            'type' => $this->type,
            'bookingId' => (string) $booking->id,
            'title' => $title,
            'body' => $salon->name,
            'url' => '/bookings',
        ];
        $hit = false;
        $subs = PushSubscription::query()->where('user_id', $customer->id)->get();
        foreach ($subs as $sub) {
            if ($push->send($sub, $payload)) {
                $hit = true;
            }
        }
        if ($hit) {
            return;
        }
        $phone = (string) $customer->phone;
        if ($phone === '' || $customer->phone_verified_at === null) {
            return;
        }
        $sms->notify($phone, CustomerStatus::smsBody($title, $salon->name));
    }
}
