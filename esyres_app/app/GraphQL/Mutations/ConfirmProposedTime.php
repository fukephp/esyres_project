<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\BroadcastCustomerResponded;
use App\GraphQL\CustomerAccess;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ConfirmProposedTime
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = CustomerAccess::verified($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->find($args['bookingId']);
            if ($booking === null || (int) $booking->customer_id !== (int) $user->id) {
                throw new ClientError('FORBIDDEN');
            }

            Booking::query()
                ->where(function ($query) use ($booking): void {
                    $query->whereKey($booking->id);
                    if ($booking->proposed_worker_id !== null) {
                        $query->orWhere('worker_id', $booking->proposed_worker_id)
                            ->orWhere('proposed_worker_id', $booking->proposed_worker_id);
                    }
                })
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $booking = Booking::query()->find($booking->id);
            if ($booking === null || (int) $booking->customer_id !== (int) $user->id) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::TIME_PROPOSED
                || $booking->proposed_starts_at === null
                || $booking->proposed_worker_id === null) {
                throw new ClientError('NOT_TIME_PROPOSED');
            }

            $start = CarbonImmutable::parse($booking->proposed_starts_at);
            if (WorkerOverlap::taken(
                (int) $booking->proposed_worker_id,
                $start,
                (int) $booking->duration_minutes,
                $booking->id,
            )) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking->worker_id = $booking->proposed_worker_id;
            $booking->preferred_starts_at = $booking->proposed_starts_at;
            $booking->preferred_date = $start->timezone('Europe/Sarajevo')->format('Y-m-d');
            $booking->status = Booking::CONFIRMED;
            $booking->proposed_starts_at = null;
            $booking->proposed_worker_id = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastCustomerResponded::send($booking);

            return $booking;
        });
    }
}
