<?php

namespace App\GraphQL;

use App\Exceptions\ClientError;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class OwnerAccess
{
    public static function user(GraphQLContext $context): User
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if ($user->email_verified_at === null) {
            throw new ClientError('EMAIL_UNVERIFIED');
        }

        return $user;
    }

    public static function salon(User $user, string $id): Salon
    {
        $salon = Salon::query()->find($id);
        if ($salon === null || $salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        return $salon;
    }

    public static function service(User $user, string $id): Service
    {
        $service = Service::query()->find($id);
        if ($service === null || $service->salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        return $service;
    }
};
