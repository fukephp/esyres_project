<?php

namespace App\GraphQL\Queries;

use App\GraphQL\OwnerAccess;
use App\Models\AssistantIntake;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class InFlightIntakeCount
{
    /**
     * @param  array{salonId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): int
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        return AssistantIntake::query()
            ->inFlight()
            ->where('salon_id', $salon->id)
            ->count();
    }
}
