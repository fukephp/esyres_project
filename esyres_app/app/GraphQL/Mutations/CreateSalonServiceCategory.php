<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\SalonServiceCategory;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreateSalonServiceCategory
{
    /**
     * @param  array{salonId: string, input: array{name: string}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): SalonServiceCategory
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        $category = new SalonServiceCategory;
        $category->salon_id = $salon->id;
        $category->fillFromInput($args['input']);
        $category->saveOrDuplicate();

        return $category;
    }
}
