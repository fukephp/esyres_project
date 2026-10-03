<?php

namespace App\GraphQL\Queries;

use App\Discovery\ListedSalon;
use App\Exceptions\ClientError;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Favorite;
use App\Models\Salon;
use App\Models\SalonServiceCategory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class SuggestedSalons
{
    /**
     * @return Collection<int, Salon>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        $serviceIds = BookingService::query()
            ->whereIn('booking_id', Booking::query()->where('customer_id', $user->id)->select('id'))
            ->whereNotNull('service_id')
            ->select('service_id');

        $keys = SalonServiceCategory::query()
            ->whereIn('legacy_key', array_keys(SalonServiceCategory::LEGACY_NAMES))
            ->whereIn('id', Service::query()->whereIn('id', $serviceIds)->select('service_category_id'))
            ->distinct()
            ->pluck('legacy_key');

        if ($keys->isEmpty()) {
            return new Collection;
        }

        $skip = Favorite::query()->where('user_id', $user->id)->pluck('salon_id')
            ->merge(
                Booking::query()
                    ->where('customer_id', $user->id)
                    ->whereIn('status', [Booking::REQUESTED, Booking::TIME_PROPOSED, Booking::CONFIRMED])
                    ->pluck('salon_id'),
            )
            ->unique()
            ->values();

        $query = Salon::query();
        ListedSalon::constrain($query);
        $query->whereHas('services.serviceCategory', static function ($groups) use ($keys): void {
            $groups->whereIn('legacy_key', $keys);
        });
        if ($skip->isNotEmpty()) {
            $query->whereNotIn('salons.id', $skip);
        }

        return $query->orderBy('salons.name')->orderBy('salons.id')->limit(3)->get();
    }
}
