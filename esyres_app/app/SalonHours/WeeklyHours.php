<?php

namespace App\SalonHours;

use App\Exceptions\ClientError;

final class WeeklyHours
{
    public const WEEKDAYS = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ];

    /**
     * @return array<string, array{closed: bool}>
     */
    public static function closedWeek(): array
    {
        $week = [];
        foreach (self::WEEKDAYS as $day) {
            $week[$day] = ['closed' => true];
        }

        return $week;
    }

    /**
     * @param  list<array<string, mixed>>  $days
     * @return array<string, array<string, mixed>>
     */
    public static function fromInput(array $days): array
    {
        if (count($days) !== 7) {
            throw new ClientError('INVALID_HOURS');
        }

        $week = [];
        foreach ($days as $day) {
            $weekday = self::weekdayKey($day['weekday'] ?? null);
            if (isset($week[$weekday])) {
                throw new ClientError('INVALID_HOURS');
            }
            $week[$weekday] = self::normalizeDay($day);
        }

        foreach (self::WEEKDAYS as $day) {
            if (! isset($week[$day])) {
                throw new ClientError('INVALID_HOURS');
            }
        }

        return $week;
    }

    /**
     * @param  array<string, array<string, mixed>>  $week
     * @return list<array<string, mixed>>
     */
    public static function toGraphQL(array $week): array
    {
        $out = [];
        foreach (self::WEEKDAYS as $day) {
            $row = $week[$day] ?? ['closed' => true];
            $out[] = [
                'weekday' => strtoupper($day),
                'closed' => (bool) ($row['closed'] ?? true),
                'opensAt' => $row['opens_at'] ?? null,
                'closesAt' => $row['closes_at'] ?? null,
                'breakStartsAt' => $row['break_starts_at'] ?? null,
                'breakEndsAt' => $row['break_ends_at'] ?? null,
            ];
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $day
     * @return array<string, mixed>
     */
    private static function normalizeDay(array $day): array
    {
        $closed = (bool) ($day['closed'] ?? false);

        if ($closed) {
            if (self::hasTime($day, 'opensAt') || self::hasTime($day, 'closesAt')
                || self::hasTime($day, 'breakStartsAt') || self::hasTime($day, 'breakEndsAt')) {
                throw new ClientError('INVALID_HOURS');
            }

            return ['closed' => true];
        }

        $opens = self::requireTime($day, 'opensAt');
        $closes = self::requireTime($day, 'closesAt');

        if (strcmp($closes, $opens) <= 0) {
            throw new ClientError('OVERNIGHT_HOURS');
        }

        $row = [
            'closed' => false,
            'opens_at' => $opens,
            'closes_at' => $closes,
        ];

        $hasBreakStart = self::hasTime($day, 'breakStartsAt');
        $hasBreakEnd = self::hasTime($day, 'breakEndsAt');
        if ($hasBreakStart !== $hasBreakEnd) {
            throw new ClientError('INVALID_BREAK');
        }

        if ($hasBreakStart) {
            $breakStart = self::requireTime($day, 'breakStartsAt');
            $breakEnd = self::requireTime($day, 'breakEndsAt');
            if (strcmp($breakStart, $opens) <= 0 || strcmp($breakEnd, $closes) >= 0 || strcmp($breakEnd, $breakStart) <= 0) {
                throw new ClientError('INVALID_BREAK');
            }
            $row['break_starts_at'] = $breakStart;
            $row['break_ends_at'] = $breakEnd;
        }

        return $row;
    }

    private static function weekdayKey(mixed $weekday): string
    {
        if (! is_string($weekday)) {
            throw new ClientError('INVALID_HOURS');
        }

        $key = strtolower($weekday);
        if (! in_array($key, self::WEEKDAYS, true)) {
            throw new ClientError('INVALID_HOURS');
        }

        return $key;
    }

    /** @param  array<string, mixed>  $day */
    private static function hasTime(array $day, string $field): bool
    {
        return isset($day[$field]) && $day[$field] !== null && $day[$field] !== '';
    }

    /** @param  array<string, mixed>  $day */
    private static function requireTime(array $day, string $field): string
    {
        $value = $day[$field] ?? null;
        if (! is_string($value) || preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) !== 1) {
            throw new ClientError('INVALID_HOURS');
        }

        $minutes = (int) substr($value, 3, 2);
        if ($minutes % 15 !== 0) {
            throw new ClientError('INVALID_TIME_STEP');
        }

        return $value;
    }
}
