<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Models\PushSubscription;
use App\Push\OwnerPush;
use App\Push\PushGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendOwnerPush implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $bookingId,
        public string $type,
    ) {}

    public function handle(PushGateway $push): void
    {
        $booking = Booking::query()->with('salon')->find($this->bookingId);
        if ($booking === null) {
            return;
        }
        $salon = $booking->salon;
        $subs = PushSubscription::query()->where('user_id', $salon->owner_id)->get();
        if ($subs->isEmpty()) {
            return;
        }
        $payload = [
            'salonId' => (string) $salon->id,
            'type' => $this->type,
            'bookingId' => (string) $booking->id,
            'title' => OwnerPush::title($this->type),
            'body' => $salon->name,
            'url' => '/owner?salon='.$salon->id,
        ];
        foreach ($subs as $sub) {
            $push->send($sub, $payload);
        }
    }
}
