<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\Favorite;
use App\Models\Salon;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UnsaveFavorite
{
    /**
     * @param  array{salonId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $salon = Salon::query()->find($args['salonId']);
        if (! $salon instanceof Salon) {
            throw new ClientError('NOT_FOUND');
        }

        Favorite::query()
            ->where('user_id', $user->id)
            ->where('salon_id', $salon->id)
            ->delete();

        return $user;
    }
}
