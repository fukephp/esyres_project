<?php

namespace App\Booking;

use App\Models\Booking;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final class WorkerOverlap
{
    /**
     * @var list<string>
     */
    public const OCCUPYING = [Booking::CONFIRMED, Booking::TIME_PROPOSED];

    public static function taken(int $workerId, CarbonInterface $start, int $duration, int $excludeId): bool
    {
        $from = CarbonImmutable::instance($start);
        $to = $from->addMinutes($duration);

        $others = Booking::query()
            ->where('id', '!=', $excludeId)
            ->whereIn('status', self::OCCUPYING)
            ->where(function ($query) use ($workerId): void {
                $query->where(function ($query) use ($workerId): void {
                    $query->where('status', Booking::CONFIRMED)->where('worker_id', $workerId);
                })->orWhere(function ($query) use ($workerId): void {
                    $query->where('status', Booking::TIME_PROPOSED)->where('proposed_worker_id', $workerId);
                });
            })
            ->get();

        foreach ($others as $other) {
            [$otherStart, $otherEnd] = self::range($other);
            if ($from->lt($otherEnd) && $otherStart->lt($to)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public static function range(Booking $booking): array
    {
        $raw = $booking->status === Booking::TIME_PROPOSED
            ? $booking->proposed_starts_at
            : $booking->preferred_starts_at;
        $start = CarbonImmutable::parse($raw);

        return [$start, $start->addMinutes((int) $booking->duration_minutes)];
    }
}
