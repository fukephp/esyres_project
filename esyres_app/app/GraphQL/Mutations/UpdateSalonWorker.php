<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Worker;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalonWorker
{
    /**
     * @param  array{id: string, input: array{name: string}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Worker
    {
        $worker = OwnerAccess::worker(OwnerAccess::user($context), $args['id']);
        $worker->fillFromInput($args['input']);
        $worker->saveOrDuplicate();

        return $worker;
    }
}
