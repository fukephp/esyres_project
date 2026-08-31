<?php

namespace App\GraphQL\Queries;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class OccupyingBookings
{
    /**
     * @param  array{salonId: string, date: string}  $args
     * @return Collection<int, Booking>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $date = $this->date($args['date']);

        $rows = Booking::query()
            ->with(['customer', 'worker', 'proposedWorker', 'services'])
            ->where('salon_id', $salon->id)
            ->whereIn('status', WorkerOverlap::OCCUPYING)
            ->get()
            ->filter(function (Booking $booking) use ($date): bool {
                return WorkerOverlap::range($booking)[0]->timezone('Europe/Sarajevo')->format('Y-m-d') === $date;
            })
            ->sortBy(fn (Booking $booking): string => WorkerOverlap::range($booking)[0]->toIso8601String())
            ->values()
            ->take(100);

        return $rows;
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
