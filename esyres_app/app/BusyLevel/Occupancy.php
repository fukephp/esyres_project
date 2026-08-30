<?php

namespace App\BusyLevel;

use App\Models\Salon;
use Carbon\CarbonImmutable;

final class Occupancy
{
    public static function percent(Salon $salon, string $date): int
    {
        $open = self::openMinutes($salon, $date);
        if ($open <= 0) {
            return 0;
        }

        $booked = (int) $salon->bookings()
            ->whereDate('preferred_date', $date)
            ->whereIn('status', ['requested', 'time_proposed', 'confirmed'])
            ->sum('duration_minutes');

        return min(100, intdiv($booked * 100, $open));
    }

    private static function openMinutes(Salon $salon, string $date): int
    {
        $weekday = strtolower(CarbonImmutable::createFromFormat('Y-m-d', $date, 'Europe/Sarajevo')->format('l'));
        $week = $salon->hours ?? [];
        $day = $week[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            return 0;
        }

        $opens = $day['opens_at'] ?? null;
        $closes = $day['closes_at'] ?? null;
        if (! is_string($opens) || ! is_string($closes)) {
            return 0;
        }

        $open = self::hhmm($closes) - self::hhmm($opens);
        $breakStart = $day['break_starts_at'] ?? null;
        $breakEnd = $day['break_ends_at'] ?? null;
        if (is_string($breakStart) && is_string($breakEnd)) {
            $open -= self::hhmm($breakEnd) - self::hhmm($breakStart);
        }

        return max(0, $open);
    }

    private static function hhmm(string $time): int
    {
        return ((int) substr($time, 0, 2)) * 60 + (int) substr($time, 3, 2);
    }
}
