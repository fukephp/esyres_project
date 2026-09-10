<?php

namespace App\GraphQL\Queries;

final class VapidPublicKey
{
    public function __invoke(): string
    {
        return (string) config('services.vapid.public_key');
    }
}
