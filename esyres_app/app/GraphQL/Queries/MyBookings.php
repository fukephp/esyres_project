<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListPage;
use App\Exceptions\ClientError;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class MyBookings
{
    /**
     * @param  array{limit?: int|null, offset?: int|null}  $args
     * @return Collection<int, Booking>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        return Booking::query()
            ->with(['salon', 'worker', 'proposedWorker', 'services'])
            ->where('customer_id', $user->id)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }
}
