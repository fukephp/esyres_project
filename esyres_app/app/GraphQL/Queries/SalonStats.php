<?php

namespace App\GraphQL\Queries;

use App\GraphQL\OwnerAccess;
use App\Stats\SalonWeekStats;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonStats
{
    /**
     * @param  array{salonId: string}  $args
     * @return array<string, mixed>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        return SalonWeekStats::for($salon);
    }
}
