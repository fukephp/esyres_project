<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AcceptPreferredTime
{
    /**
     * @param  array{bookingId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->find($args['bookingId']);
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }

            Booking::query()
                ->where(function ($query) use ($booking): void {
                    $query->whereKey($booking->id);
                    if ($booking->worker_id !== null) {
                        $query->orWhere('worker_id', $booking->worker_id);
                    }
                })
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $booking = Booking::query()->find($booking->id);
            if ($booking === null) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::REQUESTED) {
                throw new ClientError('NOT_REQUESTED');
            }
            if ($booking->worker_id === null) {
                throw new ClientError('WORKER_REQUIRED');
            }
            if (WorkerOverlap::taken($booking)) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking->status = Booking::CONFIRMED;
            if ($booking->owner_responded_at === null) {
                $booking->owner_responded_at = now();
            }
            $booking->save();

            return $booking->load(['customer', 'worker', 'services']);
        });
    }
}
