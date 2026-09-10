<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\BroadcastRescheduled;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AcceptReschedule
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
                        $query->orWhere('worker_id', $booking->worker_id)
                            ->orWhere('proposed_worker_id', $booking->worker_id);
                    }
                })
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $booking = Booking::query()->find($booking->id);
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::CONFIRMED || $booking->reschedule_starts_at === null || $booking->worker_id === null) {
                throw new ClientError('NOT_RESCHEDULE');
            }

            $start = CarbonImmutable::parse($booking->reschedule_starts_at);
            if (WorkerOverlap::taken(
                (int) $booking->worker_id,
                $start,
                (int) $booking->duration_minutes,
                $booking->id,
            )) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking->preferred_starts_at = $booking->reschedule_starts_at;
            $booking->preferred_date = $start->timezone('Europe/Sarajevo')->format('Y-m-d');
            $booking->reschedule_date = null;
            $booking->reschedule_starts_at = null;
            $booking->reminder_day_sent_at = null;
            $booking->reminder_hour_sent_at = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastRescheduled::send($booking);

            return $booking;
        });
    }
}
