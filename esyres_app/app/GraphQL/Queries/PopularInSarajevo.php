<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListFilter;
use App\Discovery\ListPage;
use App\Models\Salon;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PopularInSarajevo
{
    /**
     * @param  array{limit?: int|null, offset?: int|null, category?: string|null, name?: string|null}  $args
     * @return Collection<int, Salon>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        // ponytail: id order until Booking exists for a real popularity ranking
        $query = Salon::query();
        ListFilter::apply($query, $args['category'] ?? null, $args['name'] ?? null);

        return $query
            ->orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
