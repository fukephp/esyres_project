<?php

namespace App\Stats;

use App\BusyLevel\Occupancy;
use App\Models\Booking;
use App\Models\Salon;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

final class SalonWeekStats
{
    /**
     * @return array{
     *     fromDate: string,
     *     toDate: string,
     *     bookingsCount: int,
     *     cancellationRatePercent: int,
     *     lateCancels: int,
     *     days: list<array{date: string, weekday: string, bookingsCount: int, busyPercent: int}>,
     *     hours: list<array{hour: int, bookingsCount: int}>
     * }
     */
    public static function for(Salon $salon, ?CarbonImmutable $now = null): array
    {
        $today = ($now ?? CarbonImmutable::now('Europe/Sarajevo'))->timezone('Europe/Sarajevo')->startOfDay();
        $from = $today->subDays(6);
        $fromDate = $from->toDateString();
        $toDate = $today->toDateString();

        /** @var Collection<int, Booking> $rows */
        $rows = $salon->bookings()
            ->whereDate('preferred_date', '>=', $fromDate)
            ->whereDate('preferred_date', '<=', $toDate)
            ->whereIn('status', [Booking::CONFIRMED, Booking::CANCELLED])
            ->get();

        $bookingsCount = $rows->count();
        $cancelled = $rows->where('status', Booking::CANCELLED);
        $cancelledCount = $cancelled->count();
        $rate = $bookingsCount === 0 ? 0 : intdiv($cancelledCount * 100, $bookingsCount);
        $lateCancels = $cancelled->where('late_cancel', true)->count();

        $days = [];
        for ($day = $from; $day->lte($today); $day = $day->addDay()) {
            $date = $day->toDateString();
            $days[] = [
                'date' => $date,
                'weekday' => self::weekday($day),
                'bookingsCount' => $rows->filter(fn (Booking $row) => $row->preferred_date->toDateString() === $date)->count(),
                'busyPercent' => Occupancy::percent($salon, $date),
            ];
        }

        $hourCounts = [];
        foreach ($rows as $row) {
            $hour = CarbonImmutable::parse($row->preferred_starts_at)->timezone('Europe/Sarajevo')->hour;
            $hourCounts[$hour] = ($hourCounts[$hour] ?? 0) + 1;
        }

        $hours = [];
        foreach ($hourCounts as $hour => $count) {
            $hours[] = [
                'hour' => $hour,
                'bookingsCount' => $count,
            ];
        }
        usort($hours, function (array $a, array $b): int {
            if ($a['bookingsCount'] !== $b['bookingsCount']) {
                return $b['bookingsCount'] <=> $a['bookingsCount'];
            }

            return $a['hour'] <=> $b['hour'];
        });

        return [
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'bookingsCount' => $bookingsCount,
            'cancellationRatePercent' => $rate,
            'lateCancels' => $lateCancels,
            'days' => $days,
            'hours' => array_values($hours),
        ];
    }

    private static function weekday(CarbonImmutable $day): string
    {
        return match ($day->dayOfWeek) {
            CarbonImmutable::SUNDAY => 'SUNDAY',
            CarbonImmutable::MONDAY => 'MONDAY',
            CarbonImmutable::TUESDAY => 'TUESDAY',
            CarbonImmutable::WEDNESDAY => 'WEDNESDAY',
            CarbonImmutable::THURSDAY => 'THURSDAY',
            CarbonImmutable::FRIDAY => 'FRIDAY',
            default => 'SATURDAY',
        };
    }
}
