<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ChangePassword
{
    /**
     * @param  array{currentPassword: string, password: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        if (! Hash::check($args['currentPassword'], $user->password)) {
            throw new ClientError('INVALID_CURRENT_PASSWORD');
        }

        if (strlen($args['password']) < 8) {
            throw new ClientError('WEAK_PASSWORD');
        }

        $user->password = $args['password'];
        $user->save();
        $context->request()->session()->regenerate();

        return $user;
    }
}
