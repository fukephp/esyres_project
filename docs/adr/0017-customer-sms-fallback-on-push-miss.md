# Customer SMS fallback on push miss, not dual-send

Time-critical customer notify tries VAPID web push first, then SMS only if that push misses. Miss means the customer has no `PushSubscription` row, or every gateway send fails. At least one successful send is a hit: no SMS. There is no timed “opened” wait and no iOS UA sniff — a phone without an installed PWA typically has no subscription, so it gets SMS. SMS is sent only when `phone` is set and `phone_verified_at` is not null; do not use `hasVerifiedPhone()` (local skip would treat a null timestamp as verified). Events are owner `proposeTime`, `acceptPreferredTime`, and `declineBooking` only.

Rejected: always SMS plus push (wastes SMS when push lands), waiting N minutes for an open ping (extra infra this story does not have), and treating iOS UA as always-miss (fragile and wrong for installed PWAs).
