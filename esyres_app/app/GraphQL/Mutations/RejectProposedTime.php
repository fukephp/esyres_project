<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\BroadcastCustomerResponded;
use App\GraphQL\CustomerAccess;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RejectProposedTime
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = CustomerAccess::verified($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = CustomerAccess::lockedMine($user, $args['bookingId']);
            $booking->status = Booking::DECLINED;
            $booking->proposed_starts_at = null;
            $booking->proposed_worker_id = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastCustomerResponded::send($booking);

            return $booking;
        });
    }
}
