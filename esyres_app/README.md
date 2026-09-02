# Esyres app (Laravel + PWA)

Application root. Marketing site is `marketing/` (sibling — not under `public/`, not in the PWA). Product PWA is `frontend/` (not Laravel `resources/js`).

Slim Docker Compose (`php` + `vite` + `mysql` + `reverb`) is the local stack. Remaining services (nginx, redis, worker, mailpit) are later — see `docs/architecture/07-Docker-and-Local-Dev.md`.

Not Laravel Sail. Backend gate is Behat, not `php artisan test`.

## Verify

From this directory. `up -d` is idempotent (starts php artisan on :8000 and Vite on :5173). Do not `down` as part of verify. Never `docker compose run` for verify or servers.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T php vendor/bin/behat --suite owner
docker compose exec -T php vendor/bin/behat --suite guest
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

First time: `docker compose build php`. If MySQL was created before `docker/mysql/init.sql` existed, recreate it: `docker compose down -v` then `docker compose up -d`. Frontend `node_modules`: vite installs on first start if missing, or `docker compose exec -T vite npm install`. Marketing: `docker compose exec -T --workdir /app/marketing vite npm install`.

If `up` fails on 5173 or 8000, stop leftover `php-run-*` / `node-run-*` one-offs first. Reuse those ports; do not publish 5174/8001. Reverb is :8080.
