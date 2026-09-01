# Long-lived slim Compose (up + exec)

Slim Compose used `docker compose run --rm` for php/node verify. That creates one-off `*-run-*` containers Docker Desktop shows outside the `esyres_app` group. `--rm` only deletes them after exit, so UI loops that start Vite or `artisan serve` accumulate boxes and increment host ports (5173/8000 → 5174/8001). Isolation was fake: same bind mount, same mysql.

Slim Compose is now one long-lived project: **php** (`artisan serve` :8000) + **vite** (PWA dev :5173, `API_PROXY=http://php:8000`) + **mysql**. Verify is `docker compose up -d` then `docker compose exec -T`. Never `compose run` for verify or servers; reuse 5173/8000. nginx, redis, worker, reverb, and mailpit stay later. Decision 26’s remainder is unchanged except **vite** is in slim now. See `docs/architecture/07-Docker-and-Local-Dev.md`.
