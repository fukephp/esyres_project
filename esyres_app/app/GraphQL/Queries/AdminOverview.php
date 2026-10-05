<?php

namespace App\GraphQL\Queries;

use App\GraphQL\AdminAccess;
use App\Models\Booking;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AdminOverview
{
    /**
     * @return array{pendingSalons: int, ownedSalons: int, bookings: int}
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        AdminAccess::user($context);

        return [
            'pendingSalons' => Salon::query()->whereNull('owner_id')->count(),
            'ownedSalons' => Salon::query()->whereNotNull('owner_id')->count(),
            'bookings' => Booking::query()->count(),
        ];
    }
}
