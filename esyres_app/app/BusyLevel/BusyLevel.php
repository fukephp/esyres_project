<?php

namespace App\BusyLevel;

final class BusyLevel
{
    public const LOW = 'LOW';

    public const MEDIUM = 'MEDIUM';

    public const HIGH = 'HIGH';

    public static function fromPercent(int $percent): string
    {
        if ($percent < 50) {
            return self::LOW;
        }
        if ($percent <= 85) {
            return self::MEDIUM;
        }

        return self::HIGH;
    }
}
