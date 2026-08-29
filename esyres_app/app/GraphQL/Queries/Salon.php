<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\Models\Salon as SalonModel;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class Salon
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): SalonModel
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if ($user->email_verified_at === null) {
            throw new ClientError('EMAIL_UNVERIFIED');
        }

        $salon = SalonModel::query()->find($args['id']);
        if ($salon === null || $salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        return $salon;
    }
}
