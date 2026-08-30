<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreateBooking
{
    /**
     * @param  array{input: array{salonId: string, serviceIds: list<string>, workerId?: string|null, preferredDate: string, preferredTime: string}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Booking
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if ($user->email_verified_at === null) {
            throw new ClientError('EMAIL_UNVERIFIED');
        }
        if ($user->phone_verified_at === null) {
            throw new ClientError('PHONE_UNVERIFIED');
        }

        $input = $args['input'];
        $starts = $this->preferredStarts($input['preferredDate'], $input['preferredTime']);
        $salon = Salon::query()->find($input['salonId']);
        if ($salon === null) {
            throw new ClientError('INVALID_SERVICES');
        }
        $this->assertOpenWeekday($salon, $input['preferredDate']);

        $services = $this->services($salon, $input['serviceIds']);
        $workerId = $this->workerId($salon, $input['workerId'] ?? null);
        $duration = Booking::roundUp15(array_sum(array_map(fn (Service $s): int => $s->duration_minutes, $services)));

        return DB::transaction(function () use ($user, $salon, $services, $workerId, $starts, $input, $duration): Booking {
            $booking = new Booking;
            $booking->salon_id = $salon->id;
            $booking->customer_id = $user->id;
            $booking->worker_id = $workerId;
            $booking->preferred_date = $input['preferredDate'];
            $booking->preferred_starts_at = $starts;
            $booking->status = Booking::REQUESTED;
            $booking->duration_minutes = $duration;
            $booking->save();

            foreach ($services as $service) {
                $row = new BookingService;
                $row->booking_id = $booking->id;
                $row->name = $service->name;
                $row->duration_minutes = $service->duration_minutes;
                $row->price_feninga = $service->price_feninga;
                $row->save();
            }

            return $booking->load('services');
        });
    }

    private function preferredStarts(string $date, string $time): CarbonImmutable
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

    private function assertOpenWeekday(Salon $salon, string $date): void
    {
        $weekday = strtolower(CarbonImmutable::createFromFormat('Y-m-d', $date, 'Europe/Sarajevo')->format('l'));
        $day = ($salon->hours ?? [])[$weekday] ?? ['closed' => true];
        if (($day['closed'] ?? true) === true) {
            throw new ClientError('SALON_CLOSED');
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

    private function workerId(Salon $salon, mixed $workerId): ?int
    {
        if ($workerId === null || $workerId === '') {
            return null;
        }
        if (! is_string($workerId) && ! is_int($workerId)) {
            throw new ClientError('INVALID_WORKER');
        }

        $worker = Worker::query()->find($workerId);
        if ($worker === null || $worker->salon_id !== $salon->id) {
            throw new ClientError('INVALID_WORKER');
        }

        return $worker->id;
    }
}
