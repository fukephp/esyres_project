# Answer key: STORY-34

> Epic 8: QR reconnect — sticker sets a guest hold cookie; sessioned email+phone timestamps reconcile favorite + QR visit + scan row.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-34.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-34 |
| Source | `docs/stories/STORY-34.md` — QR reconnect |
| Goal (one sentence) | Scanning `GET /qr/{salonId}` sets `esyres_qr` (~7 days, last salon wins); when a session user has both verification timestamps, silently favorite that salon, append a `qr_scans` row, clear the cookie; guest browse stays without a login wall. |
| Branch name | `story/STORY-34-qr-reconnect` |
| Iteration cap | 8 |
| Status | draft |
| Approved by / date | |

## Pass/fail — product

- [ ] Guest `GET /qr/{salonId}` (existing salon): `Set-Cookie` `esyres_qr` = that id, httpOnly, SameSite=Lax, max-age ~7 days; 302 to `{FRONTEND_URL}/salon/{id}`; `me` still null — verify: Behat
- [ ] Guest `GET /qr/{a}` then `GET /qr/{b}`: cookie value is `b` (last wins); 302 to salon `b` — verify: Behat
- [ ] Guest `GET /qr/{missing}`: 302 to `{FRONTEND_URL}/`; no `esyres_qr` cookie — verify: Behat
- [ ] Guest `GET /salon/{id}` and public `salon(id)` do not set `esyres_qr` — verify: Behat
- [ ] Cookie for salon A, session, email verified, phone still null: `verifyPhoneOtp` success → `me.favoriteSalonIds` contains A; owner `qrScans(salonId: A)` has one row (`customerId` = that user, `salonId` = A); cookie cleared — verify: Behat
- [ ] Cookie present, sessioned signed email GET while phone already verified → same reconcile (favorite + one scan row + cookie cleared). No-session signed email GET with cookie + phone already verified → no favorite, no scan row, cookie remains — verify: Behat
- [ ] Guest scan then `login` as already both-timestamp-verified user → reconcile on login; cookie cleared — verify: Behat
- [ ] Cookie + session user with **null** timestamps (unverified): `login` / QR GET does **not** favorite or insert `qr_scans`; cookie stays on QR GET (set/refresh), login of unverified does not reconcile — verify: Behat
- [ ] `register` with cookie does not reconcile (timestamps null) — verify: Behat
- [ ] Already both-verified session `GET /qr/{id}`: reconcile immediately (favorite + scan row); response does not leave `esyres_qr` — verify: Behat
- [ ] Second reconnect same customer+salon: two `qr_scans` rows; `favoriteSalonIds` still one id — verify: Behat
- [ ] Cookie for a salon that is then deleted (or invalid payload): next login/reconcile clears cookie, writes nothing — verify: Behat
- [ ] `qrScans`: newest first; `ListPage` default 20 / max 50; guest → `UNAUTHENTICATED`; unverified-email owner → `EMAIL_UNVERIFIED`; other owner / missing salon → `FORBIDDEN` — verify: Behat
- [ ] Guest browse `/salon/:id` GraphQL still works with no login wall (existing profile scenarios stay green) — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #10 #25, ADRs 0013, 0017, 0018.

- [ ] Laravel `GET /qr/{salonId}` (not a React route, not GraphQL). Cookie `esyres_qr` httpOnly SameSite=Lax ~7 days, payload salon id string. Vite `server.proxy['/qr']` → API (same as `/sanctum`). 302 uses `FRONTEND_URL`. Organic `/salon/:id` does not set the cookie. No second sticker UI, no popup — verify: routes + `vite.config.ts`; Behat cookies; `App.tsx` has no `/qr` route and no favorites list route
- [ ] Tables: `favorites` unique `(user_id, salon_id)` + timestamps, FKs cascade; `qr_scans` (`user_id`, `salon_id`, timestamps) append-only, FKs cascade. No `visited_at`. GraphQL: `User.favoriteSalonIds: [ID!]!`; `QrScan { id, salonId, customerId, createdAt }`; `qrScans(salonId, limit, offset)` via `OwnerAccess` + `ListPage`. Reconcile is a shared PHP helper called from QR GET, `verifyPhoneOtp`, sessioned `VerifyEmailController`, `login` only — verify: migrations + schema + call sites
- [ ] Reconcile iff session + both timestamp columns non-null + valid cookie salon. Do **not** call `hasVerifiedEmail()` / `hasVerifiedPhone()` for this. `firstOrCreate` favorite; append `qr_scans`; forget cookie. No Pest, Playwright, codegen. No owner Customer History chrome, no `/favorites` list, no QR image — verify: helper source; no `pestphp`; frontend routes
- [ ] Slim Compose unchanged (no redis/nginx/mailpit/worker). Guest GraphQL stay public. Lighthouse `/graphql` only for product API besides this Laravel GET and existing `verification.verify` — verify: `esyres_app/docker-compose.yml`; schema

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

- Trust badge display (Phase 2 / STORY-35)
- QR scan conversion stats UI (STORY-37)
- Anonymous scan-hit counter
- A second reconnect QR product / owner QR artwork
- Customer Favorites list / manual heart
- Owner Customer History screen
- No-show / cancel counters (STORY-35)
- Playwright, Pest, GraphQL codegen
- Redis, nginx, mailpit, queue worker containers

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-34.md`, `docs/glossary.md` (**QR hold**, **QR reconnect**, **Favorite**, **QR visit**), `docs/adr/0017-qr-sticker-is-not-salon-profile.md`, `docs/adr/0018-qr-reconnect-requires-timestamps.md`, `docs/adr/0013-local-skip-verification-gates.md`, and `docs/architecture/` (03, 04, 05, 06, 08 #10 #25). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. No new persistent chrome. Bosnian-first if any copy is required (none expected).
2. Branch: `story/STORY-34-qr-reconnect` (keep `cursor/story-34-qr-reconnect-dc55` if that is already the working branch).
3. **HTTP:** `GET /qr/{salonId}` named route. Existing salon: `cookie()->queue('esyres_qr', id, 60*24*7)` httpOnly SameSite=Lax; 302 `SpaUrl` salon profile. Missing salon: 302 `SpaUrl` `/`; do not set cookie. If session user already has both timestamps, reconcile then 302 profile **without** leaving the cookie. Do not create a session. Do not add a React `/qr` route.
4. **Vite:** proxy `/qr` to the API (same target as `/graphql` / `/sanctum`).
5. **Schema:** `favorites`: `id`, `user_id`, `salon_id`, unique pair, timestamps, cascade FKs. `qr_scans`: `id`, `user_id`, `salon_id`, timestamps, cascade FKs, index `(salon_id, created_at)`. Models + `User::favoriteSalons()` / `qrScans()`. GraphQL fields as in architecture checks. `createdAt` ISO. Handwritten operations if the SPA must read them this PR — owner/customer chrome is out of scope, so PHP/Behat is enough; do not add a Favorites page. `ListPage::parse` on `qrScans`.
6. **Reconcile helper:** if no session user or either timestamp null → return (leave cookie unless caller is clearing a stale id). If cookie missing → return. If salon id invalid/missing → forget cookie, return. Else `firstOrCreate` favorite, insert `qr_scans`, forget cookie. Never use `hasVerified*`. Call after successful `login` (post-regenerate), successful `verifyPhoneOtp`, sessioned matching `VerifyEmailController`, and QR GET as above. Not `register`.
7. **Behat:** English Gherkin, guest + owner as needed. GET must not follow the SPA redirect (same pattern as email verify). Assert `Location` and cookies. Cover every product check. Existing features stay green. No Mink.
8. Do not add Pest, Playwright, codegen, Redis, nginx, mailpit, worker, badge UI, stats UI, QR image, `/favorites`, or Customer History chrome.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
