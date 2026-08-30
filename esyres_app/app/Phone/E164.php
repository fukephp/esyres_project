<?php

namespace App\Phone;

use App\Exceptions\ClientError;

final class E164
{
    public static function optional(mixed $phone): ?string
    {
        if (! is_string($phone)) {
            return null;
        }
        $phone = trim($phone);
        if ($phone === '') {
            return null;
        }

        return self::normalize($phone);
    }

    public static function normalize(string $raw): string
    {
        $s = preg_replace('/[\s\-\(\)]/', '', trim($raw)) ?? '';
        if (str_starts_with($s, '00')) {
            $s = '+'.substr($s, 2);
        }
        if (! str_starts_with($s, '+')) {
            throw new ClientError('INVALID_PHONE');
        }
        $digits = substr($s, 1);
        if (preg_match('/^[1-9][0-9]{7,14}$/', $digits) !== 1) {
            throw new ClientError('INVALID_PHONE');
        }

        return '+'.$digits;
    }
}
