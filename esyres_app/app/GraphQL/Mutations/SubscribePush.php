<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\PushSubscription;
use App\Models\User;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SubscribePush
{
    /**
     * @param  array{endpoint: string, p256dh: string, auth: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $row = PushSubscription::query()->where('endpoint', $args['endpoint'])->first() ?? new PushSubscription;
        $row->user_id = $user->id;
        $row->endpoint = $args['endpoint'];
        $row->p256dh = $args['p256dh'];
        $row->auth = $args['auth'];
        $row->save();

        return true;
    }
}
