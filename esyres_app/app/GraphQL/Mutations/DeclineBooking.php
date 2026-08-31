<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class DeclineBooking
{
    /**
     * @param  array{bookingId: string, reason?: string|null}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);

        return DB::transaction(function () use ($user, $args): Booking {
            $booking = Booking::query()
                ->whereKey($args['bookingId'])
                ->lockForUpdate()
                ->first();
            if ($booking === null || $booking->salon->owner_id !== $user->id) {
                throw new ClientError('FORBIDDEN');
            }
            if ($booking->status !== Booking::REQUESTED) {
                throw new ClientError('NOT_REQUESTED');
            }

            $reason = self::trimReason($args['reason'] ?? null);

            $booking->status = Booking::DECLINED;
            $booking->decline_reason = $reason;
            if ($booking->owner_responded_at === null) {
                $booking->owner_responded_at = now();
            }
            $booking->save();

            return $booking->load(['customer', 'worker', 'services']);
        });
    }

    private static function trimReason(mixed $reason): ?string
    {
        if (! is_string($reason)) {
            return null;
        }
        $trimmed = trim($reason);
        if ($trimmed === '') {
            return null;
        }
        if (mb_strlen($trimmed) > 255) {
            throw new ClientError('REASON_TOO_LONG');
        }

        return $trimmed;
    }
}
