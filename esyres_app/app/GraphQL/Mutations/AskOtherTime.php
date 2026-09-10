<?php

namespace App\GraphQL\Mutations;

use App\Booking\PreferredClock;
use App\GraphQL\BroadcastCustomerResponded;
use App\GraphQL\CustomerAccess;
use App\Push\OwnerPush;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AskOtherTime
{
    /**
     * @param  array{bookingId: string, preferredDate: string, preferredTime: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = CustomerAccess::verified($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = CustomerAccess::lockedMine($user, $args['bookingId']);
            $starts = PreferredClock::parse($args['preferredDate'], $args['preferredTime']);
            PreferredClock::assertOpenWeekday($booking->salon, $args['preferredDate']);

            $booking->preferred_date = $args['preferredDate'];
            $booking->preferred_starts_at = $starts;
            $booking->status = Booking::REQUESTED;
            $booking->proposed_starts_at = null;
            $booking->proposed_worker_id = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastCustomerResponded::send($booking);
            OwnerPush::send($booking, 'ask_other_time');

            return $booking;
        });
    }
}
