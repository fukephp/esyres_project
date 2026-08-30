<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListPage;
use App\Models\Salon;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PopularInSarajevo
{
    /**
     * @param  array{limit?: int|null, offset?: int|null}  $args
     * @return Collection<int, Salon>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        // ponytail: id order until Booking exists for a real popularity ranking
        return Salon::query()
            ->orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
