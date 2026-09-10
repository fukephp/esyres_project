<?php

namespace App\Push;

use App\Models\PushSubscription;

interface PushGateway
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function send(PushSubscription $subscription, array $payload): bool;
}
