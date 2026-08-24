# Docker and local dev

No compose file in the repo yet. When it is added, one origin through Nginx.

## Services

- **nginx** — SPA, `/graphql`, Reverb proxy
- **php-fpm** — Laravel
- **mysql**
- **redis**
- **queue worker** — same image as php-fpm
- **reverb**
- **vite** — frontend dev
- **mailpit** — catch mail

Not in the first compose: Horizon container, SMS container, Laravel Sail as the named approach.

## Local vs staging notes

- GraphQL introspection **on** locally (codegen). **Off** in staging/prod, with depth/complexity limits.
- `SmsGateway` fake/log locally.
- Photos on local `public` disk.
- Frontend talks to `/graphql` on the same host (Vite proxy in dev if needed).

Staging host and secrets are not chosen here. `deploy-staging` stays unused until a real pipeline exists.
