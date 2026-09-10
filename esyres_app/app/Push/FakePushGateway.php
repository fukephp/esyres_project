<?php

namespace App\Push;

use App\Models\PushSubscription;

final class FakePushGateway implements PushGateway
{
    /** @var list<array{userId: int, payload: array<string, mixed>}> */
    public array $sends = [];

    public bool $failNext = false;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function send(PushSubscription $subscription, array $payload): bool
    {
        if ($this->failNext) {
            $this->failNext = false;

            return false;
        }
        $this->sends[] = [
            'userId' => (int) $subscription->user_id,
            'payload' => $payload,
        ];

        return true;
    }

    public function reset(): void
    {
        $this->sends = [];
        $this->failNext = false;
    }

    /**
     * @return array{userId: int, payload: array<string, mixed>}|null
     */
    public function lastFor(int $userId): ?array
    {
        for ($i = count($this->sends) - 1; $i >= 0; $i--) {
            if ($this->sends[$i]['userId'] === $userId) {
                return $this->sends[$i];
            }
        }

        return null;
    }
}
