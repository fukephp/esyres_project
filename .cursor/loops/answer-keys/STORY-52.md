# Answer key: STORY-52

> Epic 7: add salon on `/owner/salons/create` (name + address).
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-52.md` and the story-loop grill (Q1 / Q2 / Q3 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-52 |
| Source | `docs/stories/STORY-52.md` — Add salon |
| Goal (one sentence) | Owners add another shop from `/owner/salons/create` with required name and address via `addSalon`, then land on salon edit; `/create-salon` stays name-only. |
| Branch name | `story/STORY-52-add-salon` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-13 |

## Pass/fail — product

- [x] GraphQL `addSalon(name: String!, address: String!): Salon!`. Verified owner (already owns ≥1 salon): trim both; persist name + address; hours = closed week; `cancellation_notice_hours` = 24; empty services/workers; `lat`/`lng` stay null. Return the salon — verify: Behat (`features/owner/add_salon.feature`)
- [x] Guest → `UNAUTHENTICATED`. Signed-in unverified → `EMAIL_UNVERIFIED`. Verified session with zero salons → `FORBIDDEN`. Empty or whitespace `name` → `INVALID_NAME`. Empty or whitespace `address` → `INVALID_ADDRESS`. No geocode — verify: Behat
- [x] `createSalon(name: String!)` stays name-only and still creates a second salon via API (existing `features/guest/create_salon.feature` “Mutation still creates a second salon”). Public create does not require address — verify: Behat (that scenario still green; `CreateSalon.php` unchanged)
- [x] New shop is not listed: `ListedSalon::constrain` still needs one open weekday + one service. After `addSalon`, `popularInSarajevo` does not include the new name — verify: Behat
- [x] `ownerSalonCreatePath()` returns `/owner/salons/create` with no query. `ownerSalonEditPath` / `OWNER_SALONS_PATH` unchanged. `App.tsx` lazy-loads add page; registers `path="/owner/salons/create"` **after** exact `/owner/salons` and **before** `path="/owner/salons/:id"`. `isOwnerPath('/owner/salons/create')` and `topNavSlot` stay `true` / `'session'` — verify: Vitest (`owner.test.ts` + `homepage.test.ts` + reading `App.tsx`)
- [x] i18n `bs` only this new key: `owner.addSalon` `Dodaj salon`. Reuse `owner.salonName` / `owner.address` / `owner.save` / `owner.INVALID_NAME` / `owner.INVALID_ADDRESS` / `owner.FORBIDDEN`. `createSalon.*` and `owner.createSalon` (`Napravi salon`) unchanged — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] Catalog (`OwnerSalons.tsx`): owner list unchanged except a hairline text link **under** the `<ul>` to `ownerSalonCreatePath()`, copy `owner.addSalon`, same weight as the not-owner `Napravi salon` link (`text-sm font-semibold text-ink`). Not a black pill. Not-owner shell still `CREATE_SALON_PATH` + `owner.createSalon` only — no add-salon link there. Edit page and `/owner` have no add-salon control — verify: Vitest reading `OwnerSalons.tsx` / `OwnerSalonEdit.tsx` / `OwnerHome.tsx` (flip STORY-51 “no `/owner/salons/create`” on catalog only)
- [x] `/owner/salons/create`: same overlay as catalog (`TopNav` + aside + `OwnerNav` `active="salons"`). Logged-out / unverified / zero shops: same shells as catalog (not-owner h1 `owner.title`, link to `/create-salon`). Owner: h1 `owner.addSalon`; form name + address; submit `owner.save`; `IN_FLIGHT_INTAKE_COUNT_QUERY` / OwnerNav `salonId` = `firstOwnedId`. No hours, services, workers, DND, `<select>`, `GUEST_COLUMN_CLASS`, or `t('owner.salon')` — verify: Vitest reading the new page + OwnerNav on that page
- [x] Submit calls `addSalon`; maps `INVALID_NAME` / `INVALID_ADDRESS` to those i18n keys; other errors → `salon.gate.fallback`. Success: refetch `Me`, `navigate` to `ownerSalonEditPath(id)` for the new shop. `CreateSalon.tsx` untouched (name-only, already-owner redirect to `/owner`, no OwnerNav) — verify: Vitest reading the add page + `CreateSalon.tsx` / `createSalon.test.ts` still pass
- [ ] Add form is dense owner chrome (Cal light, hairline fields, black `rounded-md` save like salon edit, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/create` add salon), `05-Data-Model.md` (add salon sets name and address; `createSalon` name-only), `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #46, `docs/adr/0031-add-salon-requires-address.md`, `docs/adr/0032-owner-salon-catalog.md`, `docs/adr/0025-self-serve-create-salon.md`.

- [x] One React PWA. Lazy owner chunk for add. Lighthouse `/graphql` `addSalon` only; no REST. `OwnerAccess::user` then require ≥1 owned salon else `FORBIDDEN`. No sibling `marketing/` — verify: Behat hits `/graphql`; this PR does not add `esyres_app/marketing` or a web.php route
- [x] i18next `bs` only. One new `owner.addSalon` key. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR edits schema/PHP/features → **Behat runs**. Do not change `behat.yml`. Do not change `/create-salon` copy, fields, or redirect — verify: CONTEXT classifier at verify time; `CreateSalon.tsx` / `createSalon(name: String!)` unchanged

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story adds GraphQL + PHP + Behat. Expected: classifier **fails** → full Behat set.

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

460 scenarios passed. 164 Vitest tests passed.

**This PR (2026-09-13):** Classifier ran Behat (PHP / `graphql/` / `features/`). Compose already up.

Passed:

```text
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

460 scenarios passed. 164 Vitest tests passed.

## Out of scope

- Hours / cancel window UI (STORY-53)
- Services UI (STORY-54)
- Workers UI (STORY-55)
- Current job labels on occupying cells (STORY-49)
- Changing `/create-salon` copy, fields, or redirect (ADR 0025)
- Blocking `createSalon` from creating a second salon via API
- Delete salon; DND; photos; coordinates; reschedule cap; geocode
- Chain multi-location / shared workers / worker login
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-52.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0031-add-salon-requires-address.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-52-add-salon` from current `master`.
3. **GraphQL:** `addSalon(name: String!, address: String!): Salon!` in `esyres_app/graphql/schema.graphql`. Class `App\GraphQL\Mutations\AddSalon`: `OwnerAccess::user`; if `$user->salons()->exists()` is false → `FORBIDDEN`; trim name/address; empty name → `INVALID_NAME`; empty address → `INVALID_ADDRESS`; `Salon::query()->create` with `owner_id`, `name`, `address` only (model boot keeps closed week / cancel 24h). Do not touch `CreateSalon.php`.
4. **Behat:** `features/owner/add_salon.feature` + OwnerSteps. Cover success (trimmed name+address, provisioned defaults except address set, not in `popularInSarajevo`), guest, unverified owner, verified customer with zero salons, blank name, blank address. Keep `features/guest/create_salon.feature` second-salon scenario green.
5. **PWA paths:** `ownerSalonCreatePath()` in `owner.ts`. Lazy add page in `App.tsx`: `/owner/salons` → `/owner/salons/create` → `/owner/salons/:id`. Mutation next to `UPDATE_SALON_MUTATION` in `graphql/auth.ts`. Assert `topNavSlot('/owner/salons/create') === 'session'`.
6. **Catalog:** `Link` under the list to create path, `owner.addSalon`. Flip `ownerSalons.source.test.ts` “no create path” on the catalog page only. `OwnerSalonEdit.tsx` / `OwnerHome.tsx` still must not match `/owner/salons/create`.
7. **Add page:** copy catalog shells (including zero-salon → `/create-salon`). OwnerNav like catalog (`salonId` = `firstOwnedId`). Form matches salon-edit field chrome. Success `navigate(ownerSalonEditPath(id))`.
8. **Copy:** one new key. Assert in `owner.test.ts`. Add the new page to `topNav.source.test.ts` / `designPack.test.ts` / `authPlace.source.test.ts` / `ownerSalons.source.test.ts` owner file lists. `CreateSalon.tsx` untouched.
9. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-52.md` Loop to `STORY-52`.
10. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: Behat (schema/PHP/features).
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
