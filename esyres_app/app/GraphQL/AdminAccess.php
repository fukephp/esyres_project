<?php

namespace App\GraphQL;

use App\Exceptions\ClientError;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AdminAccess
{
    public static function user(GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if (! $user->is_admin) {
            throw new ClientError('FORBIDDEN');
        }

        return $user;
    }
}
