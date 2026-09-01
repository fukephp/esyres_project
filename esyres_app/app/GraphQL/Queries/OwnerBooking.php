<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class OwnerBooking
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);
        $booking = Booking::query()->find($args['id']);
        if ($booking === null || $booking->salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        return $booking->load(['customer', 'worker', 'services', 'salon']);
    }
}
