<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CancelPhoneBooking
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->whereKey($args['bookingId'])->lockForUpdate()->first();
            if ($booking === null || $booking->salon->owner_id !== $user->id || $booking->origin !== Booking::ORIGIN_PHONE) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::CONFIRMED) {
                throw new ClientError('NOT_CONFIRMED');
            }
            if (now()->gte(Carbon::parse($booking->preferred_starts_at))) {
                throw new ClientError('PAST_START');
            }

            $booking->status = Booking::CANCELLED;
            $booking->cancelled_at = now();
            $booking->late_cancel = false;
            $booking->save();

            return $booking->load(['worker', 'services', 'salon']);
        });
    }
}
