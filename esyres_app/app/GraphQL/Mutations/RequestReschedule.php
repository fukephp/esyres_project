<?php

namespace App\GraphQL\Mutations;

use App\Booking\PreferredClock;
use App\Exceptions\ClientError;
use App\GraphQL\BroadcastRescheduled;
use App\GraphQL\CustomerAccess;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RequestReschedule
{
    /**
     * @param  array{bookingId: string, preferredDate: string, preferredTime: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = CustomerAccess::verified($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = CustomerAccess::lockedConfirmed($user, $args['bookingId']);
            $salon = $booking->salon;
            if ((int) $salon->reschedule_cap < 1) {
                throw new ClientError('RESCHEDULE_DISABLED');
            }
            $starts = PreferredClock::parse($args['preferredDate'], $args['preferredTime'])->timezone('Europe/Sarajevo');
            PreferredClock::assertOpenWeekday($salon, $args['preferredDate']);

            $booking->reschedule_date = $args['preferredDate'];
            $booking->reschedule_starts_at = $starts;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastRescheduled::send($booking);

            return $booking;
        });
    }
}
