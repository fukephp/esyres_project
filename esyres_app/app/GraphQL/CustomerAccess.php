<?php

namespace App\GraphQL;

use App\Exceptions\ClientError;
use App\Models\Booking;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CustomerAccess
{
    public static function verified(GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if (! $user->hasVerifiedEmail()) {
            throw new ClientError('EMAIL_UNVERIFIED');
        }
        if (! $user->hasVerifiedPhone()) {
            throw new ClientError('PHONE_UNVERIFIED');
        }

        return $user;
    }

    public static function lockedMine(User $user, string $bookingId): Booking
    {
        $booking = Booking::query()
            ->whereKey($bookingId)
            ->lockForUpdate()
            ->first();
        if ($booking === null || (int) $booking->customer_id !== (int) $user->id) {
            throw new ClientError('FORBIDDEN');
        }
        if ($booking->status !== Booking::TIME_PROPOSED) {
            throw new ClientError('NOT_TIME_PROPOSED');
        }

        return $booking;
    }
}
