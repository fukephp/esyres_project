# Answer key: STORY-50

> Epic 7: owner salon catalog + OwnerNav Saloni on every owner route.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-50.md` and the story-loop grill (Q1 / Q2 / Q3 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-50 |
| Source | `docs/stories/STORY-50.md` — Salon catalog and OwnerNav Saloni |
| Goal (one sentence) | Owners get `/owner/salons` listing shops they own with Otvoreno/Zatvoreno from hours, and OwnerNav Saloni on every owner route, without treating the switcher as a directory. |
| Branch name | `story/STORY-50-salon-catalog` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-13 |

## Pass/fail — product

- [x] `salonIsOpenNow(hours, now = new Date())` in `esyres_app/frontend/src/lib/owner.ts`: Sarajevo date + `sarajevoNowMinutes(now)` from that same `now`. Use `hoursForDate`. Open when the day is not closed, `opensAt`/`closesAt` set, now ≥ opens and **< closes** (closes exclusive), and not in the break (now ≥ `breakStartsAt` and **< `breakEndsAt`** when both set). Empty hours, missing weekday row, closed weekday, or null open/close → false. No `listed` input — verify: Vitest (`owner.test.ts`): open inside interval; false at `closesAt`; false on break start; true again at `breakEndsAt` if still before close; false closed / empty / no row
- [x] `ME_QUERY` `salons` adds existing `hours { weekday closed opensAt closesAt breakStartsAt breakEndsAt }` (same fields as `OWNER_SALON_QUERY`). `MeData.salons` includes `hours: PanelHours[]` (or equivalent). No new GraphQL field, no schema/PHP edit — verify: Vitest reading `graphql/auth.ts`; `git diff` of this PR has no `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/` files
- [x] `OWNER_SALONS_PATH` is exactly `/owner/salons`. `ownerSalonsPath()` returns that string with no query. `App.tsx` lazy-loads `OwnerSalons` like other owner pages and registers `path="/owner/salons"` before `*`. `isOwnerPath('/owner/salons')` and `topNavSlot('/owner/salons')` stay `true` / `'session'` (existing `startsWith('/owner/')`) — verify: Vitest (`owner.test.ts` + `homepage.test.ts` + reading `App.tsx`)
- [x] i18n `bs` only these new keys: `owner.salons` `Saloni`; `owner.openNow` `Otvoreno`; `owner.closedNow` `Zatvoreno`. No listed chip key — verify: Vitest (`owner.test.ts` `i18n.t` + `i18n.ts` has no new `listed` under `owner.`)
- [x] `OwnerNav` `active` includes `'salons'`. Fourth link is `to={OWNER_SALONS_PATH}` (or `ownerSalonsPath()`), label `t('owner.salons')`, never `?salon=`. Queue / chats / stats links unchanged (`ownerQueuePath` / `ownerChatPath` / `ownerStatsPath`). Rendered on OwnerHome, OwnerChats, OwnerStats, OwnerRequestDetail, OwnerSalons (desktop aside + mobile) — verify: Vitest reading `OwnerNav.tsx` + those five pages (`<OwnerNav`, `owner.salons`, no `?salon=` on the Saloni `Link`)
- [x] `/owner/salons` (`OwnerSalons.tsx`): same overlay as other owner pages (`TopNav` + `min-h-svh md:flex` aside + main). Logged-out → `auth.placePanel` + `AuthShell allowRegister={false}`. Unverified → same heading + `EmailVerifyPanel`. Zero salons → same not-owner shell as `/owner` (`owner.title` h1, `owner.notOwner`, `Link` to `CREATE_SALON_PATH` / `t('owner.createSalon')`), no `OwnerNav`. Owner: h1 `t('owner.salons')`; list every `me.salons` row as name + exactly one of `owner.openNow` / `owner.closedNow` from `salonIsOpenNow`. No `<select>`, no `t('owner.salon')`, no `?salon=` on this page, no row `Link`/`Navigate` to `/owner/salons/:id` or `/owner`. Chat badge + queue/chats/stats from first owned (`id` ASC / `salons[0]`) — verify: Vitest reading `OwnerSalons.tsx`
- [x] OwnerHome / OwnerChats / OwnerStats keep the switcher when `salons.length > 1` (`?salon=` only there). Request detail: replace the fake aside `owner.title` nav with real `OwnerNav` (booking’s `salon.id` for queue/chats/stats/badge; `firstOwnedId` from `me.salons[0]`; still no `<select>` / `t('owner.salon')`). Fetch `inFlightIntakeCount` for that salon like other owner pages — verify: Vitest reading those four files (switcher regex stays on home/chats/stats; request detail has `<OwnerNav` and no `select`)
- [x] `/create-salon` unchanged this PR (name-only, already-owner redirect, no OwnerNav, no catalog) — verify: Vitest (`topNav.source.test.ts` create-salon assertions still pass; `CreateSalon.tsx` not in the feature diff except an import only if required — it must not be)
- [ ] Catalog is a dense owner list (hairline rows, Cal light, no discovery cards, no guest column). Saloni is visible on owner routes; catalog has no switcher — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons`, OwnerNav **Saloni**, `?salon=` on queue/chats/stats only), `08-Decisions.md` #36 #42 #44 #46, `docs/adr/0032-owner-salon-catalog.md`, `docs/adr/0029-shared-top-nav.md`, `docs/adr/0025-self-serve-create-salon.md`.

- [x] One React PWA. Lazy owner chunk for the catalog. No sibling `marketing/` in this PR. No new GraphQL field, REST resource, or mutation. Hours come from existing `Salon.hours` on `me` — verify: `esyres_app/frontend/package.json` unchanged deps; no new files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. Three new `owner.*` keys listed above. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `package.json` unchanged deps; product copy check
- [x] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml`. Do not add `/owner/salons/create` or `/owner/salons/:id` this PR — verify: CONTEXT classifier at verify time; `App.tsx` has catalog path and does not register create/edit salon owner routes

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

**This PR (2026-09-13):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Vite container already up; host `tsc` not on PATH. Ran `docker compose exec -T vite npm run typecheck|test|build`.

Passed:

```text
npm run typecheck
npm run test
npm run build
```

159 tests passed.

## Out of scope

- Add salon (`/owner/salons/create`, STORY-52)
- Salon edit (`/owner/salons/:id`, STORY-51) and catalog row navigation there
- Hours / services / workers editors (STORY-53–55)
- Current job labels on occupying cells (STORY-49)
- Listed chip, photos, coordinates
- Changing `/create-salon` copy, fields, or redirect
- New GraphQL `openNow` field
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-50.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-50-salon-catalog` from current `master`.
3. **Open now:** `salonIsOpenNow(hours, now = new Date())` as the first product check. Derive Sarajevo Y-M-D from `now` (same `en-CA` + `Europe/Sarajevo` as `sarajevoToday`, but pass `now`). Reuse `hoursForDate` / `sarajevoNowMinutes`.
4. **ME_QUERY:** add `hours` on `salons`; widen `MeData`. Do not edit `schema.graphql`.
5. **Paths + nav:** `OWNER_SALONS_PATH` / `ownerSalonsPath()`. `OwnerNav` fourth item Saloni; `active: 'salons'`. Keep queue/chats/stats `?salon=` helpers.
6. **Page:** new lazy `OwnerSalons.tsx`. Copy OwnerHome’s logged-out / verify / not-owner shells (not-owner h1 stays `owner.title`). Owner list h1 is `owner.salons`. Overlay without switcher. Rows: `<li>` (or equivalent), not links. `IN_FLIGHT_INTAKE_COUNT_QUERY` skipped until first owned id exists; `firstOwnedId = salons[0].id`.
7. **Request detail:** import `OwnerNav`; aside + mobile same overlay pattern as chats (salon name may stay as the shop label, but not a `<select>`). Badge from `inFlightIntakeCount` for the booking’s salon.
8. **Copy:** three keys only. Add assertions in `owner.test.ts`. Extend `topNav.source.test.ts` / `designPack.test.ts` owner file lists with `OwnerSalons.tsx`. `CreateSalon.tsx` untouched.
9. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-50.md` Loop to `STORY-50`.
10. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
