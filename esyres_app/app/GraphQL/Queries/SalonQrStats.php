<?php

namespace App\GraphQL\Queries;

use App\GraphQL\OwnerAccess;
use App\Models\QrHit;
use App\Models\QrScan;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonQrStats
{
    /**
     * @param  array{salonId: string}  $args
     * @return array{scanCount: int, visitCount: int, conversionPercent: int}
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $scanCount = QrHit::query()->where('salon_id', $salon->id)->count();
        $visitCount = QrScan::query()->where('salon_id', $salon->id)->count();

        return [
            'scanCount' => $scanCount,
            'visitCount' => $visitCount,
            'conversionPercent' => QrHit::conversionPercent($scanCount, $visitCount),
        ];
    }
}
