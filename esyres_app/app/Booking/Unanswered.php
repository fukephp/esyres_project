<?php

namespace App\Booking;

use App\Exceptions\ClientError;
use App\Models\Booking;
use Carbon\CarbonImmutable;

final class Unanswered
{
    public static function today(): string
    {
        return CarbonImmutable::now('Europe/Sarajevo')->toDateString();
    }

    public static function closed(Booking $booking): bool
    {
        if ($booking->status === Booking::DECLINED && $booking->decline_reason === 'expired') {
            return true;
        }
        if ($booking->status !== Booking::REQUESTED) {
            return false;
        }

        return $booking->preferred_date->format('Y-m-d') < self::today();
    }

    public static function refuse(Booking $booking): void
    {
        if (self::closed($booking)) {
            throw new ClientError('EXPIRED');
        }
    }
}
