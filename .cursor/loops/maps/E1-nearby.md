# Story map: E1-nearby

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-nearby |
| Source | `docs/mvp/07-Stories.md` Epic 1 — “As a customer, I want to see salons near my current location without logging in…” plus the sibling fallback “Popular in Sarajevo” (locked into this PR 2026-08-30). |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E1-nearby.md` |

## Destination

A guest (no login) opens `/`. Browser geolocation → `salonsNearby(lat, lng)` sorted list. Permission denied or unavailable → `popularInSarajevo`. Rows are salon names linking to `/salon/:id`. Never a blank `/`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 1, `docs/architecture/` (03, 04, 05, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: public `salon(id)` + `/salon/:id`. `/` is a placeholder. No `lat`/`lng`, no list queries, no Playwright/codegen/`vite-plugin-pwa`
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not add a map SDK
  - Search/filter stays a sibling story
  - Invite-only: no public “Register salon”

## Decisions so far

- **Slice (2026-08-30):** this PR fills guest `/` with nearby **and** Popular fallback so `/` never blanks. Search/filter stays the next Epic 1 story.
- Guest browse, no login wall. Trust-badge display is Phase 2. Chat is Epic 10. QR hold cookie is Epic 8.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL, React Router + Apollo + i18next `bs` + Design 2 tokens. Not Pest, not `php artisan test` as the gate.
- **Coords (2026-08-30):** nullable `lat`/`lng` on `salons`. Founder/fixture sets them (no owner mutation this PR). No address, photos, or slug. Do not expose `lat`/`lng` on the GraphQL `Salon` type.
- **Nearby (2026-08-30):** public `salonsNearby(lat, lng, limit, offset)`. All salons with both coords, sorted by distance (`ST_Distance_Sphere`), no radius cutoff. Null coords omitted. Invalid lat/lng → `INVALID_COORDINATES`. Tie-break `id`.
- **Popular (2026-08-30):** public `popularInSarajevo(limit, offset)` when geo is denied, unavailable, or missing. **All** salons (coords optional). No booking/popularity metric yet → stable `id` order. Same list row as nearby.
- **Pagination (2026-08-30):** limit/offset; default 20, cap 50. Bad page args → `INVALID_PAGE`.
- **List row (2026-08-30):** name only, hairline list. Sort is server-side; do not show km. No busy badge, photos, or address on the row. Tap → `/salon/:id`.
- **Geo prompt (2026-08-30):** `navigator.geolocation` on `/` load. No extra “allow location” button. No map SDK. No new npm geo lib.
- **PWA libs:** keep handwritten queries. Skip this PR: GraphQL codegen, `vite-plugin-pwa`, Playwright, `/owner`.
- **Empty:** nearby with no geocoded salons → empty nearby list (still the nearby heading). Popular with zero salons → empty popular list. Not a blank page.
- Design 2 customer sparse. Bosnian-first headings: nearby “Saloni u blizini”; popular “Popularno u Sarajevu”.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Search / filter by service type or name (sibling Epic 1)
- Request picker / `createBooking` / `Pošalji zahtjev` (Epic 2)
- Salon Booking Assistant chat (Epic 10)
- Owner settings UI (`/owner`) and owner lat/lng mutation
- Photos, address, geocode UI, maps link-out
- QR hold cookie / reconcile (Epic 8)
- Booking table / real popularity ranking
- Exposing `lat`/`lng` on `Salon`
- GraphQL codegen, `vite-plugin-pwa`, Playwright
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration
