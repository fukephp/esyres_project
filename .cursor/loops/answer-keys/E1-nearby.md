# Answer key: E1-nearby

> Epic 1 guest discovery home: nearby list + Popular in Sarajevo fallback.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E1-nearby.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E1-nearby |
| Source | `docs/mvp/07-Stories.md` Epic 1 — nearby without login, plus Popular in Sarajevo fallback (locked into this PR). |
| Goal (one sentence) | A guest can open `/` (no login), see salons near them when geolocation is granted, and see Popular in Sarajevo when it is not — never a blank screen. |
| Branch name | `story/E1-nearby` |
| Iteration cap | 8 |
| Status | draft |
| Approved by / date | |

## Pass/fail — product

- [ ] A guest (no session) can query `salonsNearby(lat, lng)` and get only salons with both coords, nearest first — verify: Behat
- [ ] Salons missing lat or lng are omitted from `salonsNearby` — verify: Behat
- [ ] Invalid lat/lng is rejected with `INVALID_COORDINATES` — verify: Behat
- [ ] A guest can query `popularInSarajevo` (no session) and get all salons in stable `id` order, including those without coords — verify: Behat
- [ ] `limit`/`offset` default 20 / cap 50; bad page args → `INVALID_PAGE` — verify: Behat
- [ ] Geo grant → nearby query; deny/unavailable → popular query — verify: Vitest
- [ ] Guest `/` happy path looks right on desktop and mobile (list of names; Popular heading when geo is off) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md`.

- [ ] Lighthouse `/graphql` is the API; queries named `salonsNearby` and `popularInSarajevo`; no REST list, no map SDK — verify: Behat hits `/graphql`; no Leaflet/map package in `esyres_app/frontend/package.json`
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat guest steps; no `actingAs` / magic token in app code
- [ ] Lists use limit/offset with capped `perPage` (50) — verify: Behat `INVALID_PAGE`; schema args
- [ ] `lat`/`lng` stored on salon; not exposed on GraphQL `Salon` this PR — verify: migration; schema has no `lat`/`lng` fields
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; Behat feature exists
- [ ] No `/owner` UI, no `vite-plugin-pwa`, no Playwright, no GraphQL codegen this PR — verify: `esyres_app/frontend/package.json` and app entry

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

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
- Nginx, redis, reverb, mailpit (unless already present)
- Native apps, payments, worker logins, Pest, Inertia
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E1-nearby`.
3. **Columns:** nullable `lat`/`lng` decimals on `salons`. Founder/Behat/factory write them. No owner mutation. Do not add address/photos/slug.
4. **`salonsNearby`:** public query `salonsNearby(lat: Float!, lng: Float!, limit: Int = 20, offset: Int = 0): [Salon!]!`. Reject lat outside [-90,90] or lng outside [-180,180] with `INVALID_COORDINATES`. Reject limit < 1, limit > 50, or offset < 0 with `INVALID_PAGE`. Omit rows missing lat or lng. Sort `ST_Distance_Sphere(POINT(lng, lat), POINT(?, ?))`, then `id`. No radius.
5. **`popularInSarajevo`:** public query `popularInSarajevo(limit: Int = 20, offset: Int = 0): [Salon!]!`. All salons, `orderBy id`, same page rules. No popularity metric (no Booking table). ponytail: id order until a real ranking exists.
6. **Behat:** new English feature for guest discovery (GraphQL-over-HTTP, CSRF like existing steps, migrate-fresh + per-scenario fixtures). Cover the GraphQL product checks. Existing profile/owner features must still pass. No Mink.
7. **PWA:** replace `/` placeholder with discovery. On load, `navigator.geolocation.getCurrentPosition`. Grant → `salonsNearby`; deny/unavailable/no API → `popularInSarajevo`. Handwritten queries (`id`, `name` only). Hairline name list; `Link` to `/salon/:id`. Headings: “Saloni u blizini” / “Popularno u Sarajevu”. Empty lists stay on-page (not a blank `/`). No map SDK, no extra geo npm package. Keep i18next `bs`. Skip codegen, `vite-plugin-pwa`, Playwright, `/owner`.
8. **Vitest:** helper that maps geo grant → nearby vs deny/unavailable → popular. Keep existing KM/busy tests passing.
9. Do not add Pest. Do not add a `Booking` model.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/` happy path in the PR description (not committed). Capture Popular (geo off / denied) if that is what the agent browser can show; nearby if geolocation can be mocked. If capture/attach fails, open a **draft/blocked** PR.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
