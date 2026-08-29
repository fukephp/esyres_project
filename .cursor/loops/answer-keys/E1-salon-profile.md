# Answer key: E1-salon-profile

> Epic 1 guest salon profile (QR/IG destination). First customer PWA page.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E1-salon-profile.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-salon-profile |
| Source | `docs/mvp/07-Stories.md` Epic 1 — “As a customer, I want to see a salon’s services, prices, hours, and a busy-level badge on its profile, so that I can decide whether to request an appointment.” |
| Goal (one sentence) | A guest can open `/salon/:id` (no login) and see that salon’s name, weekly hours, services with KM prices, and today’s busy-level badge, from live GraphQL data. |
| Branch name | `story/E1-salon-profile` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-29 |

## Pass/fail — product

- [x] A guest (no session) can query `salon(id)` and read `name`, `hours` (full week, including closed days and breaks), and `services` (name, category, duration, price feninga) — verify: Behat
- [x] Missing salon id returns `salon: null`, not `UNAUTHENTICATED` / `FORBIDDEN` — verify: Behat
- [x] Guest requesting `cancellationNoticeHours` or `workers` is rejected (`UNAUTHENTICATED`); a verified owner of that salon can still read those fields — verify: Behat
- [x] `busyLevel(date: "YYYY-MM-DD")` on a salon with no bookings is `LOW` — verify: Behat
- [x] KM display helper formats integer feninga via `Intl` `bs-BA` / `BAM`; busy enum maps `LOW`/`MEDIUM`/`HIGH` to Design 2 tokens `busy-free` / `busy-moderate` / `busy-busy` — verify: Vitest
- [ ] Guest profile happy path looks right on desktop and mobile (name, hours, services, today’s badge; no picker/chat CTA) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md`.

- [x] Lighthouse `/graphql` is the API; no public REST resource for the profile — verify: Behat hits `/graphql`; no new salon-profile REST routes
- [x] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat login steps; no `actingAs` / magic token in app code
- [x] Busy-level is computed on the server; customer UI renders the enum only (no percent, no slot grid) — verify: schema has `BusyLevel` enum + `busyLevel` field; UI maps enum → token (Vitest); no percent in the guest query/UI
- [x] Money stays integer feninga in GraphQL; SPA formats KM — verify: schema `priceFeninga: Int`; Vitest formatter
- [x] No Pest; backend gate remains `vendor/bin/behat` (not `php artisan test`) — verify: no `pestphp` require; Behat feature exists
- [x] No `/owner` UI, no `vite-plugin-pwa`, no Playwright, no GraphQL codegen this PR — verify: `esyres_app/frontend/package.json` and app entry
- [x] No `Booking` table, no photos/address/slug, no QR cookie this PR — verify: migrations / schema

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). MySQL must be up. Every command must exit 0.

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Nearby / Popular in Sarajevo / search-filter (sibling Epic 1)
- Request picker / `createBooking` / `Pošalji zahtjev` (Epic 2)
- Salon Booking Assistant chat (Epic 10)
- Owner settings UI (`/owner`)
- Photos, address, geocode, maps link-out
- QR hold cookie / reconcile (Epic 8)
- Workers on the guest profile
- Booking table / non-zero occupancy
- GraphQL codegen, `vite-plugin-pwa`, Playwright
- Nginx, redis, reverb, mailpit (unless already present)
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 07, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse (not marketing IA); Bosnian-first; busy tokens as CSS variables.
2. Branch: `story/E1-salon-profile`.
3. **Public `salon(id)`:** resolver finds by id and returns `null` if missing. No login required for `name`, `hours`, `services`. Gate `cancellationNoticeHours` and `workers` with the existing owner policy (verified email + owns the salon) so guests get `UNAUTHENTICATED` if they select those fields. Do not add a second public query name.
4. **Busy-level:** GraphQL enum `BusyLevel` (`LOW`, `MEDIUM`, `HIGH`). Field `busyLevel(date: String!)` on `Salon` (`YYYY-MM-DD` Sarajevo calendar date; reject invalid). Server computes from day occupancy percent; thresholds: `<50` LOW, `50–85` MEDIUM, `>85` HIGH (placeholders from `docs/mvp/08`). No `bookings` table this PR → occupancy 0 → `LOW`. One PHP helper for the percent→enum map. Customer UI must not show percent.
5. **Behat:** new English feature for the guest profile (GraphQL-over-HTTP, CSRF like existing steps, migrate-fresh + per-scenario fixtures). Cover the product GraphQL checks above. Existing owner hours/services/workers features must still pass. No Mink. No booking features.
6. **PWA:** first customer page only. Add React Router, Apollo Client (cookie credentials + Sanctum CSRF like the SPA will), i18next default `bs` (no switcher), Design 2 CSS variables (canvas/ink/hairline + `busy-free` / `busy-moderate` / `busy-busy`). One handwritten guest `salon` query (no codegen). Route `/salon/:id`. `/` may stay a minimal placeholder — not discovery. Omit `Pošalji zahtjev` and chat. Unknown id → Bosnian not-found. Empty services → empty list, still hours + badge. Prices via `Intl` `bs-BA` / `BAM` from feninga. Today’s date for `busyLevel` is Sarajevo `YYYY-MM-DD`, not a JS `Date`. Vite proxy `/graphql` and `/sanctum` to Laravel in dev; add the Vite origin (`localhost:5173`) to `SANCTUM_STATEFUL_DOMAINS`. Do not add `vite-plugin-pwa` or Playwright. Do not add `/owner`.
7. **Vitest:** replace the placeholder with tests for the KM formatter and busy-enum → Design 2 token map. Keep `npm run test` exiting 0.
8. Do not add Pest. Do not add a `Booking` model. Do not add salon photos, address, slug, or lat/lng columns.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/salon/:id` happy path in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
