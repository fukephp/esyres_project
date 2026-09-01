# Docker and local dev

Slim Compose lives at `esyres_app/docker-compose.yml`: **php** (8.3, Composer, Artisan, Behat, `artisan serve` on :8000), **vite** (Node 22, PWA `npm run dev` on :5173, `exec` for frontend + marketing npm), and **mysql** (app DB + dedicated Behat test DB). Run `docker compose up -d` then `docker compose exec -T` from `esyres_app/`. Never `docker compose run` for verify or servers. Not Laravel Sail.

The rest of the one-origin stack is still not in this compose:

## Services (target)

- **nginx** — SPA, `/graphql`, Reverb proxy
- **php-fpm** — Laravel (replaces `artisan serve` on the slim `php` service)
- **mysql** — in slim compose now; this line stays on the target list for the full stack
- **redis**
- **queue worker** — same image as php-fpm
- **reverb**
- **vite** — in slim compose now (PWA dev server + npm exec)
- **mailpit** — catch mail

Not in compose: Horizon container, SMS container, Laravel Sail as the named approach.

## Local vs staging notes

- GraphQL introspection **on** locally (codegen). **Off** in staging/prod, with depth/complexity limits.
- `SmsGateway` fake/log locally.
- Photos on local `public` disk.
- Frontend talks to `/graphql` on the same host (Vite proxies `/graphql` and `/sanctum` to the `php` service).

Staging host and secrets are not chosen here. `deploy-staging` stays unused until a real pipeline exists.
