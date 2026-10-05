<?php

namespace App\GraphQL\Queries;

use App\Models\Salon as SalonModel;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class Salon
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): ?SalonModel
    {
        return SalonModel::query()->whereKey($args['id'])->whereNotNull('owner_id')->first();
    }
}
