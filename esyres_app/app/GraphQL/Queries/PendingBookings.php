<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListPage;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PendingBookings
{
    /**
     * @param  array{salonId: string, date: string, limit?: int|null, offset?: int|null}  $args
     * @return Collection<int, Booking>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $date = $this->date($args['date']);
        [$limit, $offset] = ListPage::parse($args['limit'] ?? null, $args['offset'] ?? null);

        return Booking::query()
            ->with(['customer', 'worker', 'services'])
            ->where('salon_id', $salon->id)
            ->where('status', Booking::REQUESTED)
            ->whereDate('preferred_date', $date)
            ->orderBy('preferred_starts_at')
            ->orderBy('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }

    private function date(string $date): string
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) !== 1) {
            throw new ClientError('INVALID_DATE');
        }
        if (! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            throw new ClientError('INVALID_DATE');
        }

        return $date;
    }
}
