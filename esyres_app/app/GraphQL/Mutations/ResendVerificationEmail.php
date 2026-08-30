<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ResendVerificationEmail
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if ($user->hasVerifiedEmail()) {
            throw new ClientError('EMAIL_ALREADY_VERIFIED');
        }

        $key = 'email-verify:'.$user->id;
        if (RateLimiter::tooManyAttempts($key, 1)) {
            throw new ClientError('TOO_MANY_ATTEMPTS');
        }
        RateLimiter::hit($key, 60);
        $user->sendEmailVerificationNotification();

        return true;
    }
}
