# Answer key: STORY-37

> Epic 9: owner QR conversion stats — sticker GET records a QR scan; reconnect remains a QR visit; `/owner/stats` shows all-time counts + percent.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-37.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-37 |
| Source | `docs/stories/STORY-37.md` — QR conversion stats |
| Goal (one sentence) | Owner of the selected salon sees all-time QR scan count, QR visit count, and conversion percent on `/owner/stats`; each successful `GET /qr/{existing}` appends a scan; visits stay `qr_scans` at reconnect. |
| Branch name | `cursor/story-37-qr-conversion-stats-c0b8` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] Existing salon `GET /qr/{id}` appends one `qr_hits` row for that salon (guest or already-verified). Missing salon 302 `/` writes no hit. Organic `/salon/{id}` and public `salon(id)` write no hit. Reconcile (`verifyPhoneOtp` / sessioned email GET / `login`) does **not** append a hit — verify: Behat
- [ ] Already-verified `GET /qr/{id}`: one new hit **and** one `qr_scans` row. Guest `GET /qr/{A}` then `GET /qr/{B}` then verify: salon A `scanCount` 1 `visitCount` 0; salon B `scanCount` 1 `visitCount` 1 — verify: Behat
- [ ] Guest two GETs same salon, then verify: `scanCount` 2, `visitCount` 1, `conversionPercent` 50. Repeat verified GET: counts both increment, percent 100 — verify: Behat
- [ ] `salonQrStats(salonId)`: `scanCount`, `visitCount`, `conversionPercent` (`Int!`). `0/0` → percent `0`. `1` visit / `3` scans → `33`. Same `OwnerAccess` as `qrScans`: guest `UNAUTHENTICATED`, unverified-email owner `EMAIL_UNVERIFIED`, other user / missing salon `FORBIDDEN`. Other owned salon does not mix counts — verify: Behat
- [ ] Backfill helper: given `qr_scans` rows and zero hits, one hit per visit row (same `salon_id`); then `scanCount == visitCount`. Migration calls that helper once after creating `qr_hits` — verify: Behat (invoke helper; do not rely on `migrate:fresh` having data)
- [ ] `/owner/stats` is lazy owner route; nav `Statistika`; labels `Skeniranja QR`, `QR posjete`, `Konverzija`; `?salon=` like chats. Helper `ownerStatsPath`. i18n keys exist. No `qrScans` list on the page. Customer `App.tsx` routes unchanged — verify: Vitest (`ownerStatsPath` + i18n keys); `App.tsx` has `/owner/stats` and no customer stats route

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #10 #22 #25, ADRs 0019, 0020, 0021.

- [ ] `qr_hits`: `id`, `salon_id` (FK cascade), timestamps, index `(salon_id, created_at)`. No `user_id`. `qr_scans` / `qrScans` list unchanged. GraphQL `SalonQrStats` + `salonQrStats(salonId)` via `OwnerAccess`. Percent: `0` if `scanCount` is 0, else `(int) round(100 * visitCount / scanCount)` (PHP default). Not on public `Salon` — verify: migration + schema; no `scanCount` on public `salon(id)`
- [ ] Hit write only in `GET /qr/{existing}` (Laravel, not a React route). Reconcile helper still favorite + `qr_scans` + forget cookie only. No Pest, Playwright, codegen, `vite-plugin-pwa`. `/owner` home stays queue + panel — verify: `QrController` + `ReconcileQrHold`; `App.tsx`; no `pestphp`
- [ ] Slim Compose unchanged. Patch `docs/architecture/04` (`/owner/stats` QR block), `05` (`qr_hits` vs `QrScan`), `06` (sticker GET records a QR scan). Do not rewrite ADR 0019/0020. ADR 0021 already on the branch — verify: those docs on the PR

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Trust badge UI (Phase 2)
- Marketing attribution beyond this QR
- Customer-facing scan stats
- STORY-36 bookings per week / busiest hours / cancellation rate / day-level busy %
- Customer History / `qrScans` list chrome
- Favorites list / manual heart
- A second reconnect QR product
- Counting organic `/salon/:id` or IG-bio as a scan
- Request→confirmed conversion
- Revenue
- Playwright, Pest, codegen, `vite-plugin-pwa`
- Redis, nginx, mailpit, queue worker containers

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-37.md`, `docs/glossary.md` (**QR scan**, **QR visit**, **QR conversion**, **QR hold**, **QR reconnect**), `docs/adr/0021-qr-scan-on-sticker-get.md` (and 0019, 0020), `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. Bosnian-first. Design 2 owner dense. UI ready = machine gates; do not embed screenshots.
2. Branch: keep `cursor/story-37-qr-conversion-stats-c0b8`.
3. **Hits:** Migration `qr_hits` as in architecture checks. Model `QrHit`. Shared PHP helper records one row for a salon; `QrController` calls it for an existing salon **before** cookie/reconcile. Missing salon: no hit (existing 302 `/`). Do **not** record a hit from `ReconcileQrHold` (login / OTP / email GET). Organic profile stays hitless.
4. **Backfill:** Same helper (or `QrHit::backfillFromVisits()`) inserts one hit per existing `qr_scans` row. Call once from the migration after `Schema::create`. Behat invokes the helper on fixture rows (truncate already wiped migrate-time data).
5. **GraphQL:** `type SalonQrStats { scanCount: Int!, visitCount: Int!, conversionPercent: Int! }` and `salonQrStats(salonId: ID!): SalonQrStats!`. Resolver uses `OwnerAccess::salon`. Counts are SQL `COUNT` for that `salon_id` (not `qrScans` pagination). Percent as above. Handwritten SPA operation; no codegen.
6. **PWA:** Lazy `/owner/stats`. Copy `OwnerChats` auth/verify/not-owner + switcher + `OwnerNav`. Nav item `Statistika` (`active: 'stats'`). `ownerStatsPath` / `ownerChatSearchParams`-style `?salon=` (no `date`). Query `salonQrStats` for the selected salon. Render the three numbers (`0` and `0%` included). i18n: `owner.stats` `Statistika`, `owner.qrScans` `Skeniranja QR`, `owner.qrVisits` `QR posjete`, `owner.qrConversion` `Konverzija` (percent via `{{n}}%`). No visit log. `/owner` home unchanged aside from the nav link.
7. **Behat:** English Gherkin. Cover every Behat product check (guest GET hits + owner `salonQrStats` + access codes + isolation + percent + backfill). Existing `qr_reconnect` / `qr_scans` stay green. GET must not follow the SPA redirect. No Mink.
8. **Vitest:** `ownerStatsPath` cases like `ownerChatPath`. Assert the four i18n strings. Keep existing owner tests green.
9. Patch architecture 04/05/06 as in the architecture checks. Do not edit `docs/mvp/`, glossary, or ADRs 0019–0021 unless a check is wrong (then stop).
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
