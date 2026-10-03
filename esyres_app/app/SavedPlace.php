<?php

namespace App;

final class SavedPlace
{
    /** @var array<string, array{0: float, 1: float}> */
    public const POINTS = [
        'Centar' => [43.8563, 18.4131],
        'Stari Grad' => [43.8590, 18.4310],
        'Novo Sarajevo' => [43.8510, 18.3980],
        'Novi Grad' => [43.8700, 18.3700],
        'Ilidža' => [43.8300, 18.3100],
        'Vogošća' => [43.9020, 18.3440],
    ];

    public static function valid(?string $name): bool
    {
        return $name === null || $name === '' || isset(self::POINTS[$name]);
    }

    /**
     * @return array{0: float, 1: float}|null
     */
    public static function point(?string $name): ?array
    {
        if ($name === null || $name === '') {
            return null;
        }

        return self::POINTS[$name] ?? null;
    }
}
