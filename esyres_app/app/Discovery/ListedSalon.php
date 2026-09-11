<?php

namespace App\Discovery;

use App\SalonHours\WeeklyHours;
use Illuminate\Database\Eloquent\Builder;

final class ListedSalon
{
    /**
     * @param  Builder<\App\Models\Salon>  $query
     */
    public static function constrain(Builder $query): void
    {
        $query->whereHas('services');
        $query->where(function (Builder $open): void {
            foreach (WeeklyHours::WEEKDAYS as $day) {
                $open->orWhereRaw(
                    "JSON_EXTRACT(`hours`, ?) = CAST('false' AS JSON)",
                    ['$.'.$day.'.closed'],
                );
            }
        });
    }
}
