<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\AssistantIntake;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class TakeOverAssistantIntake
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): AssistantIntake
    {
        $user = OwnerAccess::user($context);
        $row = AssistantIntake::query()->with('salon')->find($args['id']);
        if ($row === null || ! $row->isInFlight()) {
            throw new ClientError('FORBIDDEN');
        }
        OwnerAccess::salon($user, (string) $row->salon_id);
        if (! $row->salon->takeoverAllowed()) {
            throw new ClientError('TAKEOVER_UNAVAILABLE');
        }
        $row->taken_over_at = $row->taken_over_at ?? now();
        $row->updated_at = now();
        $row->save();

        return $row->load('customer');
    }
};
