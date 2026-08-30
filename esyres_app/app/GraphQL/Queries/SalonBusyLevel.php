<?php

namespace App\GraphQL\Queries;

use App\BusyLevel\BusyLevel;
use App\BusyLevel\Occupancy;
use App\Exceptions\ClientError;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonBusyLevel
{
    /**
     * @param  array{date: string}  $args
     */
    public function __invoke(Salon $salon, array $args, GraphQLContext $context): string
    {
        $date = $args['date'];
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) !== 1) {
            throw new ClientError('INVALID_DATE');
        }
        if (! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            throw new ClientError('INVALID_DATE');
        }

        return BusyLevel::fromPercent($this->occupancyPercent($salon, $date));
    }

    private function occupancyPercent(Salon $salon, string $date): int
    {
        return Occupancy::percent($salon, $date);
    }
}
