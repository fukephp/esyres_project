<?php

namespace App\GraphQL\Queries;

use App\Booking\QuarterStarts as QuarterStartList;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class QuarterStarts
{
    /**
     * @param  array{salonId: string, date: string, serviceIds: list<string>, workerId?: string|null}  $args
     * @return list<array{time: string, booked: bool}>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        $salon = Salon::query()->find($args['salonId']);
        if ($salon === null) {
            return [];
        }

        return QuarterStartList::list($salon, $args['date'], $args['serviceIds'], $args['workerId'] ?? null);
    }
}
