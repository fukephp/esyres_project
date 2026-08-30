<?php

namespace App\Discovery;

use App\Exceptions\ClientError;

final class ListPage
{
    public const DEFAULT_LIMIT = 20;

    public const MAX_LIMIT = 50;

    /**
     * @return array{0: int, 1: int}
     */
    public static function parse(mixed $limit, mixed $offset): array
    {
        $limit = $limit === null ? self::DEFAULT_LIMIT : (int) $limit;
        $offset = $offset === null ? 0 : (int) $offset;
        if ($limit < 1 || $limit > self::MAX_LIMIT || $offset < 0) {
            throw new ClientError('INVALID_PAGE');
        }

        return [$limit, $offset];
    }
}
