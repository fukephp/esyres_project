<?php

namespace App\Booking;

use App\Exceptions\ClientError;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Service;

final class SameDayService
{
    /**
     * @param  list<Service>  $services
     */
    public static function assertForServices(int $customerId, int $salonId, string $date, array $services, int $exceptId): void
    {
        $ids = [];
        $names = [];
        foreach ($services as $service) {
            $ids[] = (int) $service->id;
            $names[] = $service->name;
        }
        self::assertClear($customerId, $salonId, $date, $ids, $names, $exceptId);
    }

    public static function assertForBooking(Booking $booking, string $date): void
    {
        $booking->loadMissing('services');
        $ids = [];
        $names = [];
        foreach ($booking->services as $row) {
            if ($row->service_id !== null) {
                $service = Service::query()->find($row->service_id);
                if ($service !== null && (int) $service->salon_id === (int) $booking->salon_id) {
                    $ids[] = (int) $service->id;
                    $names[] = $service->name;
                }
            }
            $byName = Service::query()
                ->where('salon_id', $booking->salon_id)
                ->where('name', $row->name)
                ->first();
            if ($byName !== null) {
                $ids[] = (int) $byName->id;
                $names[] = $byName->name;
            }
        }
        self::assertClear((int) $booking->customer_id, (int) $booking->salon_id, $date, $ids, $names, (int) $booking->id);
    }

    /**
     * @param  list<int>  $ids
     * @param  list<string>  $names
     */
    private static function assertClear(int $customerId, int $salonId, string $date, array $ids, array $names, int $exceptId): void
    {
        $ids = array_values(array_unique($ids));
        $names = array_values(array_unique($names));
        if ($ids === [] && $names === []) {
            return;
        }

        $bookingIds = Booking::query()
            ->where('customer_id', $customerId)
            ->where('salon_id', $salonId)
            ->whereDate('preferred_date', $date)
            ->where('id', '!=', $exceptId)
            ->whereIn('status', [Booking::REQUESTED, Booking::TIME_PROPOSED, Booking::CONFIRMED])
            ->where('origin', '!=', Booking::ORIGIN_PHONE)
            ->pluck('id');
        if ($bookingIds->isEmpty()) {
            return;
        }

        $hit = BookingService::query()
            ->whereIn('booking_id', $bookingIds)
            ->where(function ($query) use ($ids, $names): void {
                if ($ids !== []) {
                    $query->whereIn('service_id', $ids);
                }
                if ($names !== []) {
                    $ids === [] ? $query->whereIn('name', $names) : $query->orWhereIn('name', $names);
                }
            })
            ->exists();
        if ($hit) {
            throw new ClientError('SAME_DAY_SERVICE');
        }
    }
}
