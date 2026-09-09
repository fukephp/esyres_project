<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListPage;
use App\GraphQL\OwnerAccess;
use App\Models\AssistantIntake;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class InFlightIntakes
{
    /**
     * @param  array{salonId: string, limit?: int|null, offset?: int|null}  $args
     * @return Collection<int, AssistantIntake>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        return AssistantIntake::query()
            ->inFlight()
            ->with('customer')
            ->where('salon_id', $salon->id)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
