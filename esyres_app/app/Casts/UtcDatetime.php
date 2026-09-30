<?php

namespace App\Casts;

use Carbon\CarbonImmutable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Datetime columns that store a UTC wall clock and are read in APP_TIMEZONE.
 *
 * @implements CastsAttributes<CarbonImmutable|null, CarbonImmutable|string|null>
 */
final class UtcDatetime implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?CarbonImmutable
    {
        if ($value === null) {
            return null;
        }

        return CarbonImmutable::parse($value, 'UTC')->setTimezone((string) config('app.timezone'));
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        return CarbonImmutable::parse($value)->utc()->format('Y-m-d H:i:s');
    }
}
