<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\BroadcastCustomerResponded;
use App\GraphQL\CustomerAccess;
use App\Models\Booking;
use App\Models\Salon;
use Carbon\CarbonImmutable;
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
            $starts = $this->preferredStarts($args['preferredDate'], $args['preferredTime']);
            $this->assertOpenWeekday($booking->salon, $args['preferredDate']);

            $booking->preferred_date = $args['preferredDate'];
            $booking->preferred_starts_at = $starts;
            $booking->status = Booking::REQUESTED;
            $booking->proposed_starts_at = null;
            $booking->proposed_worker_id = null;
            $booking->save();
            $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            BroadcastCustomerResponded::send($booking);

            return $booking;
        });
    }

    private function preferredStarts(string $date, string $time): CarbonImmutable
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) !== 1 || ! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            throw new ClientError('INVALID_DATE');
        }
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) !== 1) {
            throw new ClientError('INVALID_TIME');
        }

        $local = CarbonImmutable::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        if ($local === false) {
            throw new ClientError('INVALID_DATE');
        }
        if ($local->lt(CarbonImmutable::now('Europe/Sarajevo'))) {
            throw new ClientError('PAST_TIME');
        }

        return $local->utc();
    }

    private function assertOpenWeekday(Salon $salon, string $date): void
    {
        $weekday = strtolower(CarbonImmutable::createFromFormat('Y-m-d', $date, 'Europe/Sarajevo')->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            throw new ClientError('SALON_CLOSED');
        }
    }
}
