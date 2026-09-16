<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class DeleteSalonServiceCategory
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        $category = OwnerAccess::serviceCategory(OwnerAccess::user($context), $args['id']);
        if ($category->services()->exists()) {
            throw new ClientError('CATEGORY_NOT_EMPTY');
        }
        $category->delete();

        return true;
    }
}
