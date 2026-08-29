<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Service;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalonService
{
    /**
     * @param  array{id: string, input: array{name: string, category: string, durationMinutes?: int|null, priceFeninga: int}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Service
    {
        $service = OwnerAccess::service(OwnerAccess::user($context), $args['id']);
        $service->fillFromInput($args['input']);
        $service->saveOrDuplicate();

        return $service;
    }
};
