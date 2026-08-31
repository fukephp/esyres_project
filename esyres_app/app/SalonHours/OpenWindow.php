<?php

namespace App\SalonHours;

use App\Models\Salon;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final class OpenWindow
{
    public static function contains(Salon $salon, CarbonInterface $startUtc, int $durationMinutes): bool
    {
        $start = CarbonImmutable::instance($startUtc)->timezone('Europe/Sarajevo');
        $end = $start->addMinutes($durationMinutes);
        $weekday = strtolower($start->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            return false;
        }
        $opens = $day['opens_at'] ?? null;
        $closes = $day['closes_at'] ?? null;
        if (! is_string($opens) || ! is_string($closes)) {
            return false;
        }
        $ymd = $start->format('Y-m-d');
        $open = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$opens, 'Europe/Sarajevo');
        $close = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$closes, 'Europe/Sarajevo');
        if ($open === false || $close === false || $start->lt($open) || $end->gt($close)) {
            return false;
        }
        $breakStart = $day['break_starts_at'] ?? null;
        $breakEnd = $day['break_ends_at'] ?? null;
        if (is_string($breakStart) && is_string($breakEnd)) {
            $b0 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakStart, 'Europe/Sarajevo');
            $b1 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakEnd, 'Europe/Sarajevo');
            if ($b0 !== false && $b1 !== false && $start->lt($b1) && $b0->lt($end)) {
                return false;
            }
        }

        return true;
    }
}
