<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateKanbanColumns
{
    /**
     * @param  array{showInProgress: bool, showFinished: bool}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $user->show_in_progress = $args['showInProgress'];
        $user->show_finished = $args['showFinished'];
        $user->save();

        return $user;
    }
}
