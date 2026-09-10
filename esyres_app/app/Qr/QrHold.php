<?php

namespace App\Qr;

use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

final class QrHold
{
    public const COOKIE = 'esyres_qr';

    public const MINUTES = 60 * 24 * 7;

    public static function set(string $salonId): void
    {
        Cookie::queue(new SymfonyCookie(
            self::COOKIE,
            $salonId,
            time() + self::MINUTES * 60,
            '/',
            null,
            false,
            true,
            false,
            SymfonyCookie::SAMESITE_LAX,
        ));
    }

    public static function forget(): void
    {
        Cookie::queue(Cookie::forget(self::COOKIE));
    }
}
