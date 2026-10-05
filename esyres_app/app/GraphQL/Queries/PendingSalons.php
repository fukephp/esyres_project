<?php

namespace App\GraphQL\Queries;

use App\GraphQL\AdminAccess;
use App\Models\Salon;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PendingSalons
{
    /**
     * @return Collection<int, array{id: string, name: string, personName: string}>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        AdminAccess::user($context);

        return Salon::query()
            ->whereNull('owner_id')
            ->with('submitter')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(fn (Salon $salon): array => [
                'id' => (string) $salon->id,
                'name' => $salon->name,
                'personName' => $salon->submitter?->name ?? '',
            ]);
    }
}
