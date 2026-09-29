<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SalonDayBookings
{
    /**
     * @param  array{salonId: string, date: string, origin?: string|null}  $args
     * @return Collection<int, Booking>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $date = $this->date($args['date']);
        $origin = $this->origin($args['origin'] ?? null);

        return Booking::query()
            ->with(['customer', 'services'])
            ->where('salon_id', $salon->id)
            ->when($origin !== null, fn ($query) => $query->where('origin', $origin))
            ->get()
            ->filter(fn (Booking $booking): bool => $this->onDay($booking, $date))
            ->sort(function (Booking $a, Booking $b): int {
                $byStart = ($this->start($a)?->getTimestamp() ?? 0) <=> ($this->start($b)?->getTimestamp() ?? 0);

                return $byStart !== 0 ? $byStart : $a->id <=> $b->id;
            })
            ->values();
    }

    private function onDay(Booking $booking, string $date): bool
    {
        if (in_array($booking->status, [Booking::REQUESTED, Booking::DECLINED, Booking::CANCELLED], true)) {
            return $booking->preferred_date->format('Y-m-d') === $date;
        }
        $start = $this->start($booking);

        return $start !== null && $start->timezone('Europe/Sarajevo')->format('Y-m-d') === $date;
    }

    private function start(Booking $booking): ?CarbonImmutable
    {
        $raw = $booking->status === Booking::TIME_PROPOSED
            ? $booking->proposed_starts_at
            : $booking->preferred_starts_at;
        if ($raw === null) {
            return null;
        }

        return CarbonImmutable::parse($raw);
    }

    private function origin(?string $origin): ?string
    {
        return match ($origin) {
            'PICKER' => Booking::ORIGIN_PICKER,
            'ASSISTANT' => Booking::ORIGIN_ASSISTANT,
            'PHONE' => Booking::ORIGIN_PHONE,
            default => null,
        };
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
