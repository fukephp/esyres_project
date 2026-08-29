<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class Login
{
    /**
     * @param  array{email: string, password: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        if (! Auth::attempt(['email' => $args['email'], 'password' => $args['password']])) {
            throw new ClientError('INVALID_CREDENTIALS');
        }

        $context->request()->session()->regenerate();

        $user = Auth::user();
        assert($user instanceof User);

        return $user;
    }
}
