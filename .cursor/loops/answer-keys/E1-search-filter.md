# Answer key: E1-search-filter

> Epic 1 last discovery story: filter the existing nearby/Popular list by one service type or salon name.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E1-search-filter.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-search-filter |
| Source | `docs/mvp/07-Stories.md` Epic 1 — filter by service type (hair / make-up / massage) or search by name. |
| Goal (one sentence) | A guest on `/` can narrow the current nearby-or-popular list with one category chip and/or a salon-name contains query, without a blank screen. |
| Branch name | `story/E1-search-filter` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-30 |

## Pass/fail — product

- [ ] A guest can pass `category` on `salonsNearby` and `popularInSarajevo` and get only salons that have at least one service in that category; salons with no services (or only other categories) are omitted — verify: Behat
- [ ] A guest can pass `name` and get salons whose name contains that string case-insensitively; a service name that matches does not pull in the salon — verify: Behat
- [ ] `category` and `name` together AND: both constraints apply — verify: Behat
- [ ] Omitted `category` and omitted/empty/whitespace `name` leave the unfiltered list (same nearby/popular rules as E1-nearby) — verify: Behat
- [ ] Nearby with filters still omits salons missing lat or lng and stays nearest-first — verify: Behat
- [ ] `limit`/`offset` still default 20 / cap 50; bad page args → `INVALID_PAGE` — verify: Behat
- [ ] Empty-copy helper: unfiltered nearby/popular keep existing keys; any chip and/or name with zero rows uses the filtered-empty key — verify: Vitest
- [ ] Guest `/` with three chips + name field looks right on desktop and mobile — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md`.

- [ ] Lighthouse `/graphql` is the API; filters are optional args on `salonsNearby` and `popularInSarajevo`; no third list query, no REST, no Scout/Meilisearch — verify: Behat hits `/graphql`; schema has no new root list query; no `laravel/scout` or meilisearch package
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat guest steps; no `actingAs` / magic token in app code
- [ ] Lists still use limit/offset with capped `perPage` (50); filter then page — verify: Behat `INVALID_PAGE` + filtered page scenarios
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; Behat feature covers the GraphQL checks
- [ ] No `/owner` UI, no `vite-plugin-pwa`, no Playwright, no GraphQL codegen, no extra search npm package this PR — verify: `esyres_app/frontend/package.json` and app entry

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
- Nginx, redis, reverb, mailpit (unless already present)
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E1-search-filter`. Stack on E1-nearby (working tree or merged `main`). Do not re-do geo, coords, or pagination.
3. **Schema:** add optional `category: ServiceCategory` and `name: String` to `salonsNearby` and `popularInSarajevo`. Do not add a third list query.
4. **Filter helper:** one PHP helper used by both resolvers. `category` → `whereHas` services of that category (empty catalog never matches). `name` → trim; empty/whitespace → no name constraint; else case-insensitive contains on **salon** name (`LIKE %term%`, escape `%` `_` `\`). Both set → AND. Apply **before** `limit`/`offset`. Nearby still requires both coords and `ST_Distance_Sphere` then `id`. Popular still `orderBy id`. Same `INVALID_PAGE` / `INVALID_COORDINATES` as nearby.
5. **Behat:** extend the guest discovery feature (GraphQL-over-HTTP, CSRF like existing steps). Cover every GraphQL product check above. Existing nearby/popular/profile/owner features must still pass. No Mink.
6. **PWA:** on `/`, always three chips (Kosa / Šminka / Masaža — existing `category.*` keys) + a name field. Chip on/off (one or none). Pass `category` / `name` as query variables on the **current** source (nearby or popular). Debounce the name field (UI only). Headings stay “Saloni u blizini” / “Popularno u Sarajevu”. Unfiltered empty: existing copy. Filtered empty: “Nema rezultata.” Hairline name list; `Link` to `/salon/:id`. No URL query params. No map SDK, no extra search npm package. Keep i18next `bs`. Skip codegen, `vite-plugin-pwa`, Playwright, `/owner`.
7. **Vitest:** helper that picks empty-copy key from source + whether a filter is on. Keep existing discovery/KM/busy tests passing.
8. Do not add Pest. Do not add Scout/Meilisearch. Do not add a `Booking` model.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/` with chips + name field in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
