<?php

namespace App\Booking;

use App\Models\Booking;

final class WorkerOverlap
{
    /**
     * @var list<string>
     */
    public const OCCUPYING = [Booking::CONFIRMED, Booking::TIME_PROPOSED];

    public static function taken(Booking $booking): bool
    {
        $start = $booking->preferred_starts_at;
        $end = $start->copy()->addMinutes((int) $booking->duration_minutes);

        $others = Booking::query()
            ->where('worker_id', $booking->worker_id)
            ->where('id', '!=', $booking->id)
            ->whereIn('status', self::OCCUPYING)
            ->get();

        foreach ($others as $other) {
            $otherEnd = $other->preferred_starts_at->copy()->addMinutes((int) $other->duration_minutes);
            if ($start->lt($otherEnd) && $other->preferred_starts_at->lt($end)) {
                return true;
            }
        }

        return false;
    }
}
