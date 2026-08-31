<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use App\Models\Worker;
use App\SalonHours\OpenWindow;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ProposeTime
{
    /**
     * @param  array{bookingId: string, workerId: string, proposedTime: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()->find($args['bookingId']);
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }

            $worker = Worker::query()->find($args['workerId']);
            if ($worker === null || $worker->salon_id !== $booking->salon_id) {
                throw new ClientError('INVALID_WORKER');
            }

            Booking::query()
                ->where(function ($query) use ($booking, $worker): void {
                    $query->whereKey($booking->id)
                        ->orWhere('worker_id', $worker->id)
                        ->orWhere('proposed_worker_id', $worker->id);
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

            $start = $this->proposedStarts($booking->preferredDateString(), $args['proposedTime']);
            if (! OpenWindow::contains($booking->salon, $start, (int) $booking->duration_minutes)) {
                throw new ClientError('OUTSIDE_HOURS');
            }
            if (WorkerOverlap::taken($worker->id, $start, (int) $booking->duration_minutes, $booking->id)) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking->status = Booking::TIME_PROPOSED;
            $booking->proposed_starts_at = $start;
            $booking->proposed_worker_id = $worker->id;
            if ($booking->owner_responded_at === null) {
                $booking->owner_responded_at = now();
            }
            $booking->save();

            return $booking->load(['customer', 'worker', 'proposedWorker', 'services']);
        });
    }

    private function proposedStarts(string $date, string $time): CarbonImmutable
    {
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) !== 1) {
            throw new ClientError('INVALID_TIME');
        }
        if (! in_array(substr($time, 3, 2), ['00', '15', '30', '45'], true)) {
            throw new ClientError('INVALID_TIME_STEP');
        }

        $local = CarbonImmutable::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        if ($local === false) {
            throw new ClientError('INVALID_TIME');
        }
        if ($local->lt(CarbonImmutable::now('Europe/Sarajevo'))) {
            throw new ClientError('PAST_TIME');
        }

        return $local->utc();
    }
}
