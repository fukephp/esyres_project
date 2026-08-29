<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Worker;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreateSalonWorker
{
    /**
     * @param  array{salonId: string, input: array{name: string}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Worker
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        $worker = new Worker;
        $worker->salon_id = $salon->id;
        $worker->fillFromInput($args['input']);
        $worker->saveOrDuplicate();

        return $worker;
    }
}
