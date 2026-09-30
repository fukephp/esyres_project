<?php

namespace App\Booking;

use App\Models\Booking;
use App\Models\Salon;
use App\Models\Service;
use App\Models\Worker;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

final class QuarterStarts
{
    /**
     * @param  list<mixed>  $serviceIds
     * @return list<array{time: string, booked: bool}>
     */
    public static function list(Salon $salon, string $date, array $serviceIds, mixed $workerId): array
    {
        if (self::date($date) === null) {
            return [];
        }
        $services = self::services($salon, $serviceIds);
        if ($services === null) {
            return [];
        }
        $named = self::namedWorker($salon, $workerId);
        if ($named === false) {
            return [];
        }
        $duration = Booking::roundUp15(array_sum(array_map(fn (Service $service): int => $service->duration_minutes, $services)));
        if ($duration <= 0) {
            return [];
        }
        $workers = Worker::query()->where('salon_id', $salon->id)->get();
        $rows = [];
        for ($minute = 0; $minute < 24 * 60; $minute += 15) {
            $time = sprintf('%02d:%02d', intdiv($minute, 60), $minute % 60);
            $start = CarbonImmutable::createFromFormat('Y-m-d H:i', $date.' '.$time, 'Europe/Sarajevo');
            if ($start === false || self::windowCode($salon, $start, $duration) !== null) {
                continue;
            }
            $rows[] = [
                'time' => $time,
                'booked' => self::booked($workers, $named, $start, $duration),
            ];
        }

        return $rows;
    }

    public static function pickerBlock(Salon $salon, CarbonImmutable $startUtc, int $duration, ?int $workerId): ?string
    {
        $start = $startUtc->timezone('Europe/Sarajevo');
        if (! in_array($start->format('i'), ['00', '15', '30', '45'], true)) {
            return 'INVALID_TIME_STEP';
        }
        $window = self::windowCode($salon, $start, $duration);
        if ($window !== null) {
            return $window;
        }
        $workers = Worker::query()->where('salon_id', $salon->id)->get();
        $named = $workerId === null ? null : $workers->first(fn (Worker $worker): bool => $worker->id === $workerId);
        if ($workerId !== null && ! $named instanceof Worker) {
            return 'INVALID_WORKER';
        }
        if (self::booked($workers, $named instanceof Worker ? $named : null, $start, $duration)) {
            return 'SLOT_TAKEN';
        }

        return null;
    }

    /**
     * @param  Collection<int, Worker>  $workers
     */
    private static function booked(Collection $workers, ?Worker $named, CarbonImmutable $start, int $duration): bool
    {
        if ($named !== null) {
            return WorkerOverlap::taken($named->id, $start, $duration, 0);
        }
        if ($workers->isEmpty()) {
            return false;
        }
        foreach ($workers as $worker) {
            if (! WorkerOverlap::taken($worker->id, $start, $duration, 0)) {
                return false;
            }
        }

        return true;
    }

    private static function windowCode(Salon $salon, CarbonImmutable $start, int $duration): ?string
    {
        $end = $start->addMinutes($duration);
        $weekday = strtolower($start->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            return 'SALON_CLOSED';
        }
        $opens = $day['opens_at'] ?? null;
        $closes = $day['closes_at'] ?? null;
        if (! is_string($opens) || ! is_string($closes)) {
            return 'OUTSIDE_HOURS';
        }
        $ymd = $start->format('Y-m-d');
        $open = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$opens, 'Europe/Sarajevo');
        $close = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$closes, 'Europe/Sarajevo');
        if ($open === false || $close === false || $start->lt($open) || $end->gt($close)) {
            return 'OUTSIDE_HOURS';
        }
        $breakStart = $day['break_starts_at'] ?? null;
        $breakEnd = $day['break_ends_at'] ?? null;
        if (is_string($breakStart) && is_string($breakEnd)) {
            $b0 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakStart, 'Europe/Sarajevo');
            $b1 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakEnd, 'Europe/Sarajevo');
            if ($b0 !== false && $b1 !== false && $start->lt($b1) && $b0->lt($end)) {
                return 'DURING_BREAK';
            }
        }

        return null;
    }

    private static function date(string $date): ?string
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) !== 1 || ! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            return null;
        }

        return $date;
    }

    /**
     * @param  list<mixed>  $ids
     * @return list<Service>|null
     */
    private static function services(Salon $salon, array $ids): ?array
    {
        if ($ids === [] || count($ids) !== count(array_unique(array_map(strval(...), $ids)))) {
            return null;
        }
        foreach ($ids as $id) {
            if (! is_string($id) && ! is_int($id)) {
                return null;
            }
        }
        $found = Service::query()->where('salon_id', $salon->id)->whereIn('id', $ids)->get();
        if ($found->count() !== count($ids)) {
            return null;
        }
        $byId = $found->keyBy('id');
        $ordered = [];
        foreach ($ids as $id) {
            $ordered[] = $byId[(int) $id];
        }

        return $ordered;
    }

    private static function namedWorker(Salon $salon, mixed $workerId): Worker|null|false
    {
        if ($workerId === null || $workerId === '') {
            return null;
        }
        if (! is_string($workerId) && ! is_int($workerId)) {
            return false;
        }
        $worker = Worker::query()->find($workerId);
        if ($worker === null || $worker->salon_id !== $salon->id) {
            return false;
        }

        return $worker;
    }
}
