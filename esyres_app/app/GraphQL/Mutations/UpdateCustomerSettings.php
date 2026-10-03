<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use App\SavedPlace;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateCustomerSettings
{
    /**
     * @param  array{name: string, savedPlace?: string|null}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $name = trim($args['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }

        $place = $args['savedPlace'] ?? null;
        if ($place === '') {
            $place = null;
        }
        if (! SavedPlace::valid($place)) {
            throw new ClientError('INVALID_PLACE');
        }

        $user->name = $name;
        $user->saved_place = $place;
        $user->save();

        return $user;
    }
}
