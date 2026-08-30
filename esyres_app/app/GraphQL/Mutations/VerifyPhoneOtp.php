<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use App\Otp\PhoneOtp;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class VerifyPhoneOtp
{
    /**
     * @param  array{code: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        app(PhoneOtp::class)->verify($user, $args['code']);

        return true;
    }
}
