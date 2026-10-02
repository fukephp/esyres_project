<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Worker;
use App\SalonMedia\SalonImages;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RemoveWorkerPhoto
{
    /**
     * @param  array{workerId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Worker
    {
        $worker = OwnerAccess::worker(OwnerAccess::user($context), $args['workerId']);
        SalonImages::removeWorkerPhoto($worker);

        return $worker->fresh() ?? $worker;
    }
}
