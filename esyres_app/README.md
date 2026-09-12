# Esyres app (Laravel + PWA)

Application root. Product PWA is `frontend/` (not Laravel `resources/js`). There is no sibling marketing site; the homepage lives in the PWA on typed `/`.

Slim Docker Compose (`php` + `vite` + `mysql` + `reverb`) is the local stack. Remaining services (nginx, redis, worker, mailpit) are later — see `docs/architecture/07-Docker-and-Local-Dev.md`.

Not Laravel Sail. Backend gate is Behat, not `php artisan test`.

## Verify

Agent default: run the **frontend-only classifier** in `.cursor/CONTEXT.md` first. If every changed `esyres_app/` path is under `frontend/`, skip Behat/php/mysql and from `frontend/` run:

```text
npm run typecheck
npm run test
npm run build
```

(`docker compose exec -T vite npm run …` only if that container is already up.) Humans can still ask for full Behat; `--suite owner|guest` always runs Behat.

When Behat runs, from this directory. `up -d` is idempotent (starts php artisan on :8000 and Vite on :5173). Do not `down` as part of verify. Never `docker compose run` for verify or servers.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure --suite owner
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure --suite guest
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

Behat loads `.env.behat` (`esyres_test` only; never the seeded `esyres` app DB). Do not `migrate:fresh` on `esyres`. Cloud Agent: frontend-only is host npm from `frontend/` (no PHP/MySQL). If Behat runs without a real Docker daemon: host PHP + host MySQL (same Behat flags); do not nest `docker.io`.

First time: `docker compose build php`. If MySQL was created before `docker/mysql/init.sql` existed, recreate it: `docker compose down -v` then `docker compose up -d`. Frontend `node_modules`: vite installs on first start if missing, or `docker compose exec -T vite npm install`.

If `up` fails on 5173 or 8000, stop leftover `php-run-*` / `node-run-*` one-offs first. Reuse those ports; do not publish 5174/8001. Reverb is :8080.

## Local demo seed

App DB only, when `APP_ENV=local`. Throws on staging, production, and Behat (`testing`). Behat stays per-scenario Gherkin fixtures — do not `db:seed` the test DB.

```text
docker compose exec -T php php artisan migrate:fresh --seed
```

| Email | Password | Role |
|-------|----------|------|
| `owner@esyres.test` | `password` | Owner (two salons) |
| `guest@esyres.test` | `password` | Customer |
| `owner2@esyres.test` | `password` | Owner (one salon, discovery) |
