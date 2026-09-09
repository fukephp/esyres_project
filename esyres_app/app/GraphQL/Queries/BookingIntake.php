<?php

namespace App\GraphQL\Queries;

use App\Models\AssistantIntake;
use App\Models\Booking;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class BookingIntake
{
    public function __invoke(Booking $booking, array $args, GraphQLContext $context): ?AssistantIntake
    {
        $user = $context->user();
        if (! $user instanceof User) {
            return null;
        }
        if ($booking->salon->owner_id !== $user->id) {
            return null;
        }

        return $booking->intake;
    }
}
