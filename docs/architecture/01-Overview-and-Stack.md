# Overview and stack

Application code is in `esyres_app/` (Laravel 13 + React TypeScript PWA placeholder). Product scope stays in `docs/mvp/`.

## Locked stack

| Layer | Choice |
|-------|--------|
| Backend | Laravel API, Lighthouse GraphQL (code-first), MySQL |
| Auth | Laravel Sanctum cookie session (httpOnly, SameSite=Lax, CSRF on mutations) |
| Realtime | Laravel Reverb + Lighthouse subscriptions |
| Cache / OTP / queues | Redis |
| Frontend | One React TypeScript PWA (Vite), Apollo Client, GraphQL Code Generator |
| UI | Tailwind CSS, i18next default `bs`, React Router (`/` customer, `/owner` owner) |
| PWA | `vite-plugin-pwa` + Workbox, native Web Push (VAPID) |
| Owner grid | `@dnd-kit` + tap/form fallback |
| Tests | Behat GraphQL HTTP (backend); Vitest + Playwright (frontend) |
| Local run | Docker Compose in `esyres_app/` (slim: `php` + `node`; full list later) |

Same origin: Nginx serves the SPA at `/`, GraphQL at `/graphql`, Reverb on the same host. No split `app.` / `api.` domains at MVP.

## Repo layout

One git repo. Application code is not at the git root.

- `esyres_app/` — Laravel (`artisan`, `composer.json`, `app/`)
- `esyres_app/frontend/` — Vite React TypeScript PWA (product SPA; not `resources/js`)
- `esyres_app/marketing/` — Design 1 static marketing site (sibling under the Laravel root)
- `esyres_app/docker-compose.yml` — slim `php` + `node` (full service list later)
- `docs/mvp/` — product
- `docs/architecture/` — this set

## Out of scope for this architecture

Next.js, Inertia, Redux, Storybook, MUI/Ant, Bootstrap, Leaflet/Google Maps SDK, Spatie Media Library, Pest, Scout/Meilisearch, Octane, Elasticsearch, OneSignal, worker logins, in-app payments, REST as a second public API.

## Related product overrides

Auth, owner invite, salon switcher, per-service duration, preferred time, “ask for a different day or time”, and the scripted salon booking assistant were grilled against `docs/mvp/` and then patched there so product truth and architecture do not diverge. See [08-Decisions.md](08-Decisions.md). Assistant v1 does not add a stack component (no LLM, no WhatsApp).
