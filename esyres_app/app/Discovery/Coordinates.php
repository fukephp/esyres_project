<?php

namespace App\Discovery;

use App\Exceptions\ClientError;

final class Coordinates
{
    public static function assert(mixed $lat, mixed $lng): void
    {
        if (! is_numeric($lat) || ! is_numeric($lng)) {
            throw new ClientError('INVALID_COORDINATES');
        }
        $lat = (float) $lat;
        $lng = (float) $lng;
        if (! is_finite($lat) || ! is_finite($lng) || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            throw new ClientError('INVALID_COORDINATES');
        }
    }
}
