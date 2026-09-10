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

    public function dnd(Salon $salon, array $args, GraphQLContext $context): bool
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return $salon->dnd === true;
    }

    public function takeoverAllowed(Salon $salon, array $args, GraphQLContext $context): bool
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return $salon->takeoverAllowed();
    }

    public function noShowCount(Salon $salon, array $args, GraphQLContext $context): int
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return (int) ($salon->fresh()?->no_show_count ?? 0);
    }

    public function cancelCount(Salon $salon, array $args, GraphQLContext $context): int
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return (int) ($salon->fresh()?->cancel_count ?? 0);
    }

    public function lateCancelCount(Salon $salon, array $args, GraphQLContext $context): int
    {
        OwnerAccess::salon(OwnerAccess::user($context), (string) $salon->id);

        return (int) ($salon->fresh()?->late_cancel_count ?? 0);
    }
}
