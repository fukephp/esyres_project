<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateOwnerView
{
    /**
     * @param  array{view: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $user->owner_view = strtolower($args['view']);
        $user->save();

        return $user;
    }
}
