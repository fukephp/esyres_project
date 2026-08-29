# Story map: E1-salon-profile

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-salon-profile |
| Source | `docs/mvp/07-Stories.md` Epic 1 — “As a customer, I want to see a salon’s services, prices, hours, and a busy-level badge on its profile, so that I can decide whether to request an appointment.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E1-salon-profile.md` |

## Destination

A guest (no login) opens `/salon/:id` and sees that salon’s name, weekly hours, services (name, category, duration, KM price), and today’s busy-level badge. That URL is the QR/IG destination. Epic 2 adds `Pošalji zahtjev`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 1, `docs/architecture/` (03, 04, 05, 07, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today (`esyres_app/`): Lighthouse `/graphql`, Sanctum cookies, `Salon` + hours + services + workers. `salon(id)` is owner-only. No address/photos/slug. No `Booking`. PWA is the throwaway placeholder (no Router / Apollo / i18n).
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not expand into discovery, picker, chat, owner UI, or QR cookie
  - Invite-only: no public “Register salon”

## Decisions so far

- Epic 1 this story only: guest profile with services, prices, hours, busy badge (story text). Nearby / Popular / search-filter are sibling stories.
- **Slice (2026-08-29):** first **guest page** `/salon/:id` plus public GraphQL. Not GraphQL-only. Not a fat profile (no photos, address, maps link, workers on the page, or inert `Pošalji zahtjev`).
- Guest browse, no login wall. Trust-badge **display** is Phase 2. Chat is Epic 10. QR hold cookie is Epic 8.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL test DB. Not Pest, not `php artisan test` as the gate.
- Prices are integer feninga (`Int` in GraphQL), formatted as KM in the UI via `Intl` `bs-BA`. Copy is Bosnian-first (i18next `bs`, no language switcher).
- **Public GraphQL (2026-08-29):** keep one `salon(id)`. Guests may read `name`, `hours`, `services`. `cancellationNoticeHours` and `workers` stay owner-gated (verified email + owns the salon). Missing id → `null`, not `UNAUTHENTICATED`. Owner Behat keeps working.
- **URL (2026-08-29):** `/salon/:id` with bigint GraphQL `ID`. No slug this PR.
- **Busy on the profile (2026-08-29):** **today** (Sarajevo). Week strip belongs with Epic 2 picker. Field `busyLevel(date: String!)` (`YYYY-MM-DD`) returns server enum `LOW | MEDIUM | HIGH` so Epic 2 can reuse it. Customer UI renders the enum only, not percent. Thresholds stay the 08 placeholders (🟢 <50%, 🟡 50–85%, 🔴 >85%). No `Booking` table this PR → occupancy 0 → **LOW**.
- **CTA (2026-08-29):** omit `Pošalji zahtjev` and chat. Dead button is worse than no button.
- **Hours on profile (2026-08-29):** full week including closed days and breaks; hide cancellation notice from guests.
- **PWA libs (2026-08-29):** React Router + Apollo cookie client + one handwritten query + i18next `bs` + Design 2 CSS variables (including busy tokens). Skip this PR: GraphQL codegen, `vite-plugin-pwa`, Playwright, `/owner`, discovery routes. Vite proxy `/graphql` (and Sanctum CSRF) in dev; nginx still later. Add Vite origin to `SANCTUM_STATEFUL_DOMAINS`.
- **Empty / missing (2026-08-29):** empty catalog → empty services list, still hours + badge. Unknown id → GraphQL `null`; page shows Bosnian not-found.
- Design 2 customer sparse layout. Busy tokens `busy-free` / `busy-moderate` / `busy-busy` as CSS variables, not owner cell tokens.
- Photos, address, maps link, lat/lng: Key Features, but no columns yet and not this story’s text — out.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Nearby / Popular in Sarajevo / search-filter (sibling Epic 1)
- Request picker / `createBooking` / `Pošalji zahtjev` (Epic 2)
- Salon Booking Assistant chat (Epic 10)
- Owner settings UI (`/owner`)
- Photos, address, geocode, maps link-out
- QR hold cookie / reconcile (Epic 8)
- Workers on the guest profile
- Booking table / occupancy other than 0
- GraphQL codegen, `vite-plugin-pwa`, Playwright
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration
