<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\SalonServiceCategory;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalonServiceCategory
{
    /**
     * @param  array{id: string, input: array{name: string}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): SalonServiceCategory
    {
        $category = OwnerAccess::serviceCategory(OwnerAccess::user($context), $args['id']);
        $category->fillFromInput($args['input']);
        $category->saveOrDuplicate();

        return $category;
    }
}
