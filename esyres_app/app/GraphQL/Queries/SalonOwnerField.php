<?php

namespace App\GraphQL\Queries;

use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use Illuminate\Database\Eloquent\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonOwnerField
{
    public function cancellationNoticeHours(Salon $salon, array $args, GraphQLContext $context): int
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return $salon->cancellation_notice_hours;
    }

    /**
     * @return Collection<int, \App\Models\Worker>
     */
    public function workers(Salon $salon, array $args, GraphQLContext $context): Collection
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return $salon->workerList();
    }
}
