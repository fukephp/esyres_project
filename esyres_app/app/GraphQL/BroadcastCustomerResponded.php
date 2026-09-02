<?php

namespace App\GraphQL;

use App\Models\Booking;
use Nuwave\Lighthouse\Execution\Utils\Subscription;

final class BroadcastCustomerResponded
{
    public static function send(Booking $booking): void
    {
        Subscription::broadcast('bookingCustomerResponded', $booking, false);
    }
}
