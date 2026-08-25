# Overview and stack

Application code is **not** in this repo yet. These files describe the locked target architecture. Product scope stays in `docs/mvp/`.

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
| Local run | Docker Compose (documented, not written) |

Same origin: Nginx serves the SPA at `/`, GraphQL at `/graphql`, Reverb on the same host. No split `app.` / `api.` domains at MVP.

## Planned repo layout

One git repo (not created as app folders yet):

- `backend/` — Laravel
- `frontend/` — Vite React PWA
- `docker-compose.yml` — root, later
- `docs/mvp/` — product
- `docs/architecture/` — this set

## Out of scope for this architecture (still no code)

Next.js, Inertia, Redux, Storybook, MUI/Ant, Bootstrap, Leaflet/Google Maps SDK, Spatie Media Library, Pest, Scout/Meilisearch, Octane, Elasticsearch, OneSignal, worker logins, in-app payments, REST as a second public API.

## Related product overrides

Auth, owner invite, salon switcher, per-service duration, and “ask for a different day” were grilled against `docs/mvp/` and then patched there so product truth and architecture do not diverge. See [08-Decisions.md](08-Decisions.md).
