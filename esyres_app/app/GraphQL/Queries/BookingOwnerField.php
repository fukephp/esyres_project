<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class BookingOwnerField
{
    public function noShowAt(Booking $booking, array $args, GraphQLContext $context): ?string
    {
        $user = OwnerAccess::user($context);
        if ((int) $booking->salon->owner_id !== (int) $user->id) {
            throw new ClientError('FORBIDDEN');
        }
        if ($booking->no_show_at === null) {
            return null;
        }

        return $booking->no_show_at->utc()->toIso8601String();
    }
}
