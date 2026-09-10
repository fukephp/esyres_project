<?php

namespace App\Support;

final class SpaUrl
{
    public static function origin(): string
    {
        return rtrim((string) (config('app.frontend_url') ?: config('app.url')), '/');
    }

    public static function home(): string
    {
        return self::origin().'/';
    }

    public static function salon(string $id): string
    {
        return self::origin().'/salon/'.$id;
    }

    public static function bookings(string $query): string
    {
        return self::origin().'/bookings?'.$query;
    }
}
