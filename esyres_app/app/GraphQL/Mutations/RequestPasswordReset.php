<?php

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Password;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RequestPasswordReset
{
    /**
     * Always true so the answer does not reveal which emails have accounts.
     *
     * @param  array{email: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        $email = strtolower(trim($args['email']));
        if (filter_var($email, FILTER_VALIDATE_EMAIL) !== false) {
            Password::broker()->sendResetLink(['email' => $email]);
        }

        return true;
    }
}
