<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\BroadcastCancelled;
use App\GraphQL\CustomerAccess;
use App\Models\Booking;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CancelBooking
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = CustomerAccess::verified($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = CustomerAccess::lockedConfirmed($user, $args['bookingId']);
            $start = Carbon::parse($booking->preferred_starts_at);
            $now = now();
            if ($now->gte($start)) {
                throw new ClientError('PAST_START');
            }
            $late = $now->gte($start->copy()->subHours((int) $booking->salon->cancellation_notice_hours));
            $booking->status = Booking::CANCELLED;
            $booking->cancelled_at = $now;
            $booking->late_cancel = $late;
            $booking->reschedule_date = null;
            $booking->reschedule_starts_at = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastCancelled::send($booking);

            return $booking;
        });
    }
}
