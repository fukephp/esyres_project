<?php

namespace App\Push;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

final class LogPushGateway implements PushGateway
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function send(PushSubscription $subscription, array $payload): bool
    {
        $public = (string) config('services.vapid.public_key');
        $private = (string) config('services.vapid.private_key');
        if ($public === '' || $private === '') {
            Log::info('web push', $payload);

            return true;
        }
        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject' => (string) config('services.vapid.subject'),
                    'publicKey' => $public,
                    'privateKey' => $private,
                ],
            ]);
            $report = $webPush->sendOneNotification(
                Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'keys' => [
                        'p256dh' => $subscription->p256dh,
                        'auth' => $subscription->auth,
                    ],
                ]),
                json_encode($payload, JSON_THROW_ON_ERROR),
            );
            if (! $report->isSuccess()) {
                Log::info('web push failed', ['reason' => $report->getReason()]);

                return false;
            }
        } catch (Throwable $e) {
            Log::info('web push failed', ['error' => $e->getMessage()]);

            return false;
        }

        Log::info('web push', $payload);

        return true;
    }
}
