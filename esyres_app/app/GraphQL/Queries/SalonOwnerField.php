<?php

namespace App\GraphQL\Queries;

use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonOwnerField
{
    public function cancellationNoticeHours(Salon $salon, array $args, GraphQLContext $context): int
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return $salon->cancellation_notice_hours;
    }
}
