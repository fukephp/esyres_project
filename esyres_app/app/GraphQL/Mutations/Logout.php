<?php

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class Logout
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        Auth::logout();
        $context->request()->session()->invalidate();
        $context->request()->session()->regenerateToken();

        return true;
    }
}
