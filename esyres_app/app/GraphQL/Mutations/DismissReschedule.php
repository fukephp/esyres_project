<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\BroadcastRescheduled;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class DismissReschedule
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->whereKey($args['bookingId'])->lockForUpdate()->first();
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::CONFIRMED || $booking->reschedule_starts_at === null) {
                throw new ClientError('NOT_RESCHEDULE');
            }

            $booking->reschedule_date = null;
            $booking->reschedule_starts_at = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastRescheduled::send($booking);

            return $booking;
        });
    }
}
