<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Service;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreateSalonService
{
    /**
     * @param  array{salonId: string, input: array{name: string, category: string, durationMinutes?: int|null, priceFeninga: int}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Service
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        $service = new Service;
        $service->salon_id = $salon->id;
        $service->fillFromInput($args['input']);
        $service->saveOrDuplicate();

        return $service;
    }
};
