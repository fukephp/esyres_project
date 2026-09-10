<?php

namespace App\Push;

use App\Models\PushSubscription;

final class FakePushGateway implements PushGateway
{
    /** @var array<string, mixed>|null */
    public ?array $last = null;

    public ?int $lastUserId = null;

    public function send(PushSubscription $subscription, array $payload): void
    {
        $this->last = $payload;
        $this->lastUserId = (int) $subscription->user_id;
    }

    public function reset(): void
    {
        $this->last = null;
        $this->lastUserId = null;
    }
}
