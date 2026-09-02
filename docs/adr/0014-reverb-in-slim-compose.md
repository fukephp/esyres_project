# Reverb in slim Compose without Redis

Owner in-app freshness (STORY-20) needs Laravel Reverb + Lighthouse subscriptions. Slim Compose now includes a `reverb` service (same PHP image, port 8080). Lighthouse subscription storage stays on Laravel cache (`database` locally, in-memory `subscriptions` store in Behat). Redis, nginx, and a queue worker stay later. Broadcasts are inline (`LIGHTHOUSE_QUEUE_BROADCASTS=false`) because there is no worker. Vite proxies `/app` to Reverb so the PWA stays on :5173.

Rejected: Apollo `pollInterval` (architecture 06: owner should not poll), adding Redis just for Lighthouse’s default store, and queued broadcasts that would sit until a worker exists.
