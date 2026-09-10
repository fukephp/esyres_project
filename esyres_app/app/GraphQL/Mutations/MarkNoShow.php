<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use App\Models\Salon;
use App\Models\User;
use App\Trust\Counters;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class MarkNoShow
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

            Booking::query()->whereKey($booking->id)->lockForUpdate()->first();
            $booking = Booking::query()->find($booking->id);
            if ($booking === null) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::CONFIRMED) {
                throw new ClientError('NOT_CONFIRMED');
            }
            $start = Carbon::parse($booking->preferred_starts_at);
            if (now()->lt($start)) {
                throw new ClientError('NOT_STARTED');
            }
            if ($booking->no_show_at !== null) {
                return $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
            }

            $customer = User::query()->whereKey($booking->customer_id)->lockForUpdate()->first();
            $salon = Salon::query()->whereKey($booking->salon_id)->lockForUpdate()->first();
            if ($customer === null || $salon === null) {
                throw new ClientError('FORBIDDEN');
            }

            $booking->no_show_at = now();
            $booking->reschedule_date = null;
            $booking->reschedule_starts_at = null;
            $booking->save();
            Counters::onNoShow($customer, $salon);

            return $booking->load(['customer', 'worker', 'proposedWorker', 'services', 'salon']);
        });
    }
}
