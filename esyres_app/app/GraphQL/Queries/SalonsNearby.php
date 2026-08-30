<?php

namespace App\GraphQL\Queries;

use App\Discovery\Coordinates;
use App\Discovery\ListFilter;
use App\Discovery\ListPage;
use App\Models\Salon;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonsNearby
{
    /**
     * @param  array{lat: float, lng: float, limit?: int|null, offset?: int|null, category?: string|null, name?: string|null}  $args
     * @return Collection<int, Salon>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        Coordinates::assert($args['lat'], $args['lng']);
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        $query = Salon::query()
            ->whereNotNull('lat')
            ->whereNotNull('lng');
        ListFilter::apply($query, $args['category'] ?? null, $args['name'] ?? null);

        return $query
            ->orderByRaw(
                'ST_Distance_Sphere(POINT(lng, lat), POINT(?, ?))',
                [(float) $args['lng'], (float) $args['lat']],
            )
            ->orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
