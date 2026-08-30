# Story map: E1-search-filter

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-search-filter |
| Source | `docs/mvp/07-Stories.md` Epic 1 — “As a customer, I want to filter by service type (hair / make-up / massage) or search by name, so that I can find a relevant salon quickly.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E1-search-filter.md` |

## Destination

A guest on `/` narrows the current nearby-or-popular list with one category chip and/or a salon-name contains query. Same name rows linking to `/salon/:id`. Never a blank `/`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 1, `docs/architecture/` (03, 04, 05, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: E1-nearby discovery home (`salonsNearby` / `popularInSarajevo`, geo grant vs deny, name list on `/`). Service already has `ServiceCategory` (`HAIR` / `MAKE_UP` / `MASSAGE`). No search args, no Meilisearch. Nearby key may still be uncommitted — this story overlays that list.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not add a map SDK or Scout/Meilisearch
  - Do not re-do geo, coords, or pagination
  - Invite-only: no public “Register salon”

## Decisions so far

- **Slice (2026-08-30):** overlay filter/search on the existing discovery list. Do not add a third list query. Do not client-filter the current page (pagination would lie).
- Guest browse, no login wall. Trust-badge display is Phase 2. Chat is Epic 10. QR hold cookie is Epic 8.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL, React Router + Apollo + i18next `bs` + Design 2 tokens. Not Pest, not `php artisan test` as the gate.
- **API (2026-08-30):** optional `category: ServiceCategory` and `name: String` on `salonsNearby` and `popularInSarajevo`. Same sort and `limit`/`offset` (default 20, cap 50, `INVALID_PAGE`). Filter then page.
- **Category (2026-08-30):** one optional type, or none. Chip on/off. Keep salons with at least one `Service` in that category. Empty catalog never matches a type filter. Multi-select is out.
- **Name (2026-08-30):** salon name only, case-insensitive contains (`LIKE %term%`, `utf8mb4_unicode_ci`). Trim; empty/whitespace/omit = no name filter. Escape `%` `_` `\`. No service-name match. Bosnian diacritics stay distinct (`š` ≠ `s`).
- **Combine (2026-08-30):** both set → AND. Nearby still omits null coords and sorts by distance. Popular still `id` order, including salons without coords.
- **Chips (2026-08-30):** always show three (Kosa / Šminka / Masaža). Zero matches for a selected type still shows the empty filtered list. No extra catalog query.
- **UI (2026-08-30):** chips + name field on `/`. Headings stay “Saloni u blizini” / “Popularno u Sarajevu”. As-you-type with a short debounce (UI only). No URL query params this PR. Same name-only hairline rows; tap → `/salon/:id`.
- **Empty (2026-08-30):** unfiltered empty keeps existing nearby/popular copy. Any chip and/or name with zero rows → “Nema rezultata.” Stay on `/`, same heading, not a blank page.
- **PWA libs:** keep handwritten queries. Skip this PR: GraphQL codegen, `vite-plugin-pwa`, Playwright, `/owner`, extra search npm package.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Re-doing nearby / Popular / geo / coords / pagination (sibling E1-nearby)
- Third GraphQL list query (`searchSalons` or similar)
- Scout / Meilisearch / client-only page filter
- Multi-select categories; filter by service name
- Shareable URL query params
- Request picker / `createBooking` / `Pošalji zahtjev` (Epic 2)
- Salon Booking Assistant chat (Epic 10)
- Owner settings UI (`/owner`)
- Photos, address, geocode UI, maps link-out
- QR hold cookie / reconcile (Epic 8)
- Booking table / real popularity ranking
- Exposing `lat`/`lng` on `Salon`
- GraphQL codegen, `vite-plugin-pwa`, Playwright
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration
