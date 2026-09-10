<?php

namespace App\Push;

use App\Jobs\SendCustomerStatus;
use App\Models\Booking;

final class CustomerStatus
{
    public const TITLES = [
        'time_proposed' => 'Predloženo vrijeme',
        'confirmed' => 'Potvrđeno',
        'declined' => 'Odbijeno',
    ];

    public static function send(Booking $booking, string $type): void
    {
        SendCustomerStatus::dispatch((int) $booking->id, $type);
    }

    public static function title(string $type): string
    {
        return self::TITLES[$type] ?? $type;
    }

    public static function smsBody(string $title, string $salon): string
    {
        return $title.'. '.$salon.'.';
    }
}
