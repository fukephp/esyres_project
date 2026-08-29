<?php

namespace App\Exceptions;

use GraphQL\Error\ClientAware;
use GraphQL\Error\ProvidesExtensions;
use RuntimeException;

final class ClientError extends RuntimeException implements ClientAware, ProvidesExtensions
{
    public function __construct(
        private readonly string $errorCode,
    ) {
        parent::__construct($errorCode);
    }

    public function isClientSafe(): bool
    {
        return true;
    }

    /** @return array{code: string} */
    public function getExtensions(): array
    {
        return ['code' => $this->errorCode];
    }
}
