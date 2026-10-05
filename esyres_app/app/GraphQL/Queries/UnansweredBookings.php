<?php

namespace App\GraphQL\Queries;

use App\Booking\Unanswered;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UnansweredBookings
{
    /**
     * @param  array{salonId: string, date: string}  $args
     * @return Collection<int, Booking>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $date = $this->date($args['date']);
        $today = Unanswered::today();

        return Booking::query()
            ->with(['customer', 'worker', 'services'])
            ->where('salon_id', $salon->id)
            ->whereDate('preferred_date', $date)
            ->where(function ($query) use ($today): void {
                $query->where(function ($query): void {
                    $query->where('status', Booking::DECLINED)->where('decline_reason', 'expired');
                })->orWhere(function ($query) use ($today): void {
                    $query->where('status', Booking::REQUESTED)->whereDate('preferred_date', '<', $today);
                });
            })
            ->orderByRaw('preferred_starts_at IS NULL')
            ->orderBy('preferred_starts_at')
            ->orderBy('id')
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
