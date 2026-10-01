<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use App\Models\Worker;
use App\Push\CustomerStatus;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AssignWorker
{
    /**
     * @param  array{bookingId: string, workerId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        $booking = DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->find($args['bookingId']);
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }

            $workerId = (int) $args['workerId'];
            Booking::query()
                ->where(function ($query) use ($booking, $workerId): void {
                    $query->whereKey($booking->id)
                        ->orWhere('worker_id', $workerId)
                        ->orWhere('proposed_worker_id', $workerId);
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
            if ($booking->worker_id !== null) {
                throw new ClientError('WORKER_NAMED');
            }
            if ($booking->preferred_starts_at === null) {
                throw new ClientError('TIME_REQUIRED');
            }

            $worker = Worker::query()->find($workerId);
            if ($worker === null || (int) $worker->salon_id !== (int) $booking->salon_id) {
                throw new ClientError('INVALID_WORKER');
            }
            if (WorkerOverlap::taken(
                $workerId,
                $booking->preferred_starts_at,
                (int) $booking->duration_minutes,
                $booking->id,
            )) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking->worker_id = $workerId;
            $booking->status = Booking::CONFIRMED;
            if ($booking->owner_responded_at === null) {
                $booking->owner_responded_at = now();
            }
            $booking->save();

            return $booking->load(['customer', 'worker', 'services']);
        });
        CustomerStatus::send($booking, 'confirmed');

        return $booking;
    }
}
