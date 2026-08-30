<?php

namespace App\Support;

final class SpaUrl
{
    public static function bookings(string $query): string
    {
        $base = rtrim((string) (config('app.frontend_url') ?: config('app.url')), '/');

        return $base.'/bookings?'.$query;
    }
}
