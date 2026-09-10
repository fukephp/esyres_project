<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListPage;
use App\GraphQL\OwnerAccess;
use App\Models\QrScan;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class QrScans
{
    /**
     * @param  array{salonId: string, limit?: int|null, offset?: int|null}  $args
     * @return Collection<int, QrScan>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        return QrScan::query()
            ->where('salon_id', $salon->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
