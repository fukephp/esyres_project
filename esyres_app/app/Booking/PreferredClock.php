<?php

namespace App\Booking;

use App\Exceptions\ClientError;
use App\Models\Salon;
use Carbon\CarbonImmutable;

final class PreferredClock
{
    public static function parse(string $date, string $time): CarbonImmutable
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) !== 1 || ! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            throw new ClientError('INVALID_DATE');
        }
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) !== 1) {
            throw new ClientError('INVALID_TIME');
        }

        $local = CarbonImmutable::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
        if ($local === false) {
            throw new ClientError('INVALID_DATE');
        }
        if ($local->lt(CarbonImmutable::now('Europe/Sarajevo'))) {
            throw new ClientError('PAST_TIME');
        }

        return $local->utc();
    }

    public static function assertOpenWeekday(Salon $salon, string $date): void
    {
        $weekday = strtolower(CarbonImmutable::createFromFormat('Y-m-d', $date, 'Europe/Sarajevo')->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            throw new ClientError('SALON_CLOSED');
        }
    }
}
