# Esyres app (Laravel + PWA)

Application root. Marketing site is `marketing/` (sibling — not under `public/`, not in the PWA). Product PWA is `frontend/` (not Laravel `resources/js`).

Slim Docker Compose (`php` + `node` + `mysql`) is for local verify. Full stack (nginx, redis, worker, reverb, vite, mailpit) is later — see `docs/architecture/07-Docker-and-Local-Dev.md`.

Not Laravel Sail. Backend gate is Behat, not `php artisan test`.

## Verify

From this directory:

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

First time: `docker compose build php`. If MySQL was created before `docker/mysql/init.sql` existed, recreate it: `docker compose down -v` then `docker compose up -d mysql`. Frontend: `docker compose run --rm --workdir /app/frontend node npm install`. Marketing: `docker compose run --rm --workdir /app/marketing node npm install`.
