<?php

namespace App\GraphQL\Mutations;

use App\Booking\WorkerOverlap;
use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Salon;
use App\Models\Service;
use App\Models\Worker;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreatePhoneBooking
{
    /**
     * @param  array{input: array{salonId: string, serviceIds: list<string>, preferredDate: string, preferredTime: string, workerId: string, callerName: string, callerPhone?: string|null, callerNote?: string|null}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = OwnerAccess::user($context);
        $input = $args['input'];
        $salon = OwnerAccess::salon($user, $input['salonId']);
        $name = trim($input['callerName']);
        if ($name === '') {
            throw new ClientError('INVALID_CALLER_NAME');
        }
        $starts = $this->starts($input['preferredDate'], $input['preferredTime']);
        $services = $this->services($salon, $input['serviceIds']);
        $duration = Booking::roundUp15(array_sum(array_map(fn (Service $s): int => $s->duration_minutes, $services)));
        $this->assertWindow($salon, $starts, $duration);
        $worker = Worker::query()->find($input['workerId']);
        if ($worker === null || $worker->salon_id !== $salon->id) {
            throw new ClientError('INVALID_WORKER');
        }

        return DB::transaction(function () use ($salon, $services, $worker, $starts, $input, $duration, $name): Booking {
            Booking::query()
                ->where('worker_id', $worker->id)
                ->orWhere('proposed_worker_id', $worker->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            // Datetime columns are written as a UTC wall clock and read back in APP_TIMEZONE.
            $asStored = CarbonImmutable::parse($starts->utc()->format('Y-m-d H:i:s'), (string) config('app.timezone'));
            if (WorkerOverlap::taken($worker->id, $asStored, $duration, 0)) {
                throw new ClientError('SLOT_TAKEN');
            }

            $booking = new Booking;
            $booking->salon_id = $salon->id;
            $booking->customer_id = null;
            $booking->worker_id = $worker->id;
            $booking->preferred_date = $input['preferredDate'];
            $booking->preferred_starts_at = $starts;
            $booking->status = Booking::CONFIRMED;
            $booking->duration_minutes = $duration;
            $booking->origin = Booking::ORIGIN_PHONE;
            $booking->caller_name = $name;
            $booking->caller_phone = $this->blankToNull($input['callerPhone'] ?? null);
            $booking->caller_note = $this->blankToNull($input['callerNote'] ?? null);
            $booking->save();

            foreach ($services as $service) {
                $row = new BookingService;
                $row->booking_id = $booking->id;
                $row->name = $service->name;
                $row->duration_minutes = $service->duration_minutes;
                $row->price_feninga = $service->price_feninga;
                $row->save();
            }

            return $booking->load(['worker', 'services', 'salon']);
        });
    }

    private function starts(string $date, string $time): CarbonImmutable
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

        return $local->utc();
    }

    private function assertWindow(Salon $salon, CarbonImmutable $startUtc, int $duration): void
    {
        $start = $startUtc->timezone('Europe/Sarajevo');
        $end = $start->addMinutes($duration);
        $weekday = strtolower($start->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            throw new ClientError('SALON_CLOSED');
        }
        $opens = $day['opens_at'] ?? null;
        $closes = $day['closes_at'] ?? null;
        if (! is_string($opens) || ! is_string($closes)) {
            throw new ClientError('OUTSIDE_HOURS');
        }
        $ymd = $start->format('Y-m-d');
        $open = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$opens, 'Europe/Sarajevo');
        $close = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$closes, 'Europe/Sarajevo');
        if ($open === false || $close === false || $start->lt($open) || $end->gt($close)) {
            throw new ClientError('OUTSIDE_HOURS');
        }
        $breakStart = $day['break_starts_at'] ?? null;
        $breakEnd = $day['break_ends_at'] ?? null;
        if (is_string($breakStart) && is_string($breakEnd)) {
            $b0 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakStart, 'Europe/Sarajevo');
            $b1 = CarbonImmutable::createFromFormat('Y-m-d H:i', $ymd.' '.$breakEnd, 'Europe/Sarajevo');
            if ($b0 !== false && $b1 !== false && $start->lt($b1) && $b0->lt($end)) {
                throw new ClientError('DURING_BREAK');
            }
        }
    }

    /**
     * @param  list<string>  $ids
     * @return list<Service>
     */
    private function services(Salon $salon, array $ids): array
    {
        if ($ids === [] || count($ids) !== count(array_unique($ids))) {
            throw new ClientError('INVALID_SERVICES');
        }

        $found = Service::query()->where('salon_id', $salon->id)->whereIn('id', $ids)->get();
        if ($found->count() !== count($ids)) {
            throw new ClientError('INVALID_SERVICES');
        }

        $byId = $found->keyBy('id');
        $ordered = [];
        foreach ($ids as $id) {
            $ordered[] = $byId[(int) $id];
        }

        return $ordered;
    }

    private function blankToNull(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
