<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;
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

    /**
     * @return Collection<int, Booking>
     */
    public function priorConfirmedBookings(Booking $booking, array $args, GraphQLContext $context): Collection
    {
        $user = OwnerAccess::user($context);
        if ((int) $booking->salon->owner_id !== (int) $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        return Booking::query()
            ->where('salon_id', $booking->salon_id)
            ->where('customer_id', $booking->customer_id)
            ->where('status', Booking::CONFIRMED)
            ->whereKeyNot($booking->id)
            ->orderByDesc('preferred_starts_at')
            ->orderByDesc('id')
            ->get();
    }
}
