<?php

namespace App\Push;

use App\Jobs\SendOwnerPush;
use App\Models\Booking;

final class OwnerPush
{
    public const TITLES = [
        'requested' => 'Novi zahtjev',
        'confirmed' => 'Gost je prihvatio',
        'rejected' => 'Gost je odbio',
        'ask_other_time' => 'Gost traži drugo vrijeme',
        'reschedule' => 'Gost traži premještaj',
    ];

    public static function send(Booking $booking, string $type): void
    {
        SendOwnerPush::dispatch((int) $booking->id, $type);
    }

    public static function title(string $type): string
    {
        return self::TITLES[$type] ?? $type;
    }
}
