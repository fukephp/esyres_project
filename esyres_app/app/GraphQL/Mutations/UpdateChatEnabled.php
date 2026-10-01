<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateChatEnabled
{
    /**
     * @param  array{enabled: bool}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $user->chat_enabled = $args['enabled'];
        $user->save();

        return $user;
    }
}
