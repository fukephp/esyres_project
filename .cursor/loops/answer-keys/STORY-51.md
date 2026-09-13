# Answer key: STORY-51

> Epic 7: salon edit name + address on `/owner/salons/:id`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-51.md` and the story-loop grill (Q1 / Q2 / Q3 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-51 |
| Source | `docs/stories/STORY-51.md` — Salon edit name and address |
| Goal (one sentence) | Owners edit name and address on `/owner/salons/:id` (catalog row → that URL), via `updateSalon`, without hours/services/workers or add-salon. |
| Branch name | `story/STORY-51-salon-edit` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-13 |

## Pass/fail — product

- [x] GraphQL `updateSalon(salonId: ID!, input: UpdateSalonInput!): Salon!` with `UpdateSalonInput { name: String! address: String! }`. Verified owner of that salon: trim both; persist name + address; `lat`/`lng` unchanged (stay null if they were). Return the salon — verify: Behat (`features/owner/update_salon.feature`)
- [x] Guest → `UNAUTHENTICATED`. Signed-in unverified → `EMAIL_UNVERIFIED`. Missing id or another user’s salon → `OwnerAccess::salon` → `FORBIDDEN`. Empty or whitespace `name` → `INVALID_NAME`. Empty or whitespace `address` → `INVALID_ADDRESS`. Does not write blank address (column may stay null on shops never saved here) — verify: Behat
- [x] Public `salon(id).address` stays nullable. Guest profile still omits when missing. After a successful `updateSalon`, public `salon(id)` returns the new name and address. No geocode — verify: Behat (existing guest omit still green; owner feature reads address back)
- [x] `ME_QUERY` `salons` adds existing `address`. `MeData.salons` includes `address: string | null`. No new GraphQL field besides `updateSalon` / `UpdateSalonInput` — verify: Vitest reading `graphql/auth.ts`; schema has `updateSalon` + `address` on `Salon` (already there)
- [x] `ownerSalonEditPath(id)` returns `/owner/salons/${id}` with no `/edit`, no query. `OWNER_SALONS_PATH` stays `/owner/salons`. `App.tsx` lazy-loads `OwnerSalonEdit` and registers `path="/owner/salons/:id"` **after** exact `/owner/salons`. No `path="/owner/salons/create"`. `isOwnerPath('/owner/salons/1')` and `topNavSlot` stay `true` / `'session'` — verify: Vitest (`owner.test.ts` + reading `App.tsx`)
- [x] i18n `bs` only these new keys: `owner.salonName` `Ime salona`; `owner.address` `Adresa`; `owner.save` `Spremi`; `owner.INVALID_NAME` `Unesi ime salona.`; `owner.INVALID_ADDRESS` `Unesi adresu.`; `owner.FORBIDDEN` `Salon nije tvoj.` — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] Catalog (`OwnerSalons.tsx`): each row name is `<Link to={ownerSalonEditPath(row.id)}>`; Otvoreno/Zatvoreno stays text (not a link). No `<select>`, no `?salon=`, no `/owner/salons/create`. Not-owner shell unchanged — verify: Vitest reading `OwnerSalons.tsx` (update `ownerSalons.source.test.ts`: allow `/owner/salons/` on the name `Link`; still no create path)
- [x] `/owner/salons/:id` (`OwnerSalonEdit.tsx`): same overlay as catalog (`TopNav` + aside + `OwnerNav` `active="salons"`). Logged-out / unverified / zero shops: same shells as catalog (not-owner h1 `owner.title`). Owner: find `:id` in `me.salons`. Missing from list: overlay + `t('owner.FORBIDDEN')`, no form, do **not** query public `salon(id)`. Hit: h1 is that row’s name; form name + address (empty string if `address` null) + save; `IN_FLIGHT_INTAKE_COUNT_QUERY` / OwnerNav `salonId` = route id; `firstOwnedId` = `salons[0].id`; Saloni link stays `OWNER_SALONS_PATH`. No hours, services, workers, DND, `<select>`, or `t('owner.salon')` — verify: Vitest reading `OwnerSalonEdit.tsx` + `OwnerNav` on that page
- [x] Save calls `updateSalon` with trimmed fields; maps `INVALID_NAME` / `INVALID_ADDRESS` to those i18n keys; other errors → `salon.gate.fallback`. Stay on the page; refetch `Me`. `CreateSalon.tsx` untouched — verify: Vitest reading `OwnerSalonEdit.tsx` + `CreateSalon.tsx` / `topNav.source.test.ts` still pass
- [ ] Edit form is dense owner chrome (Cal light, hairline fields, black save like create-salon `rounded-md`, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` salon edit), `05-Data-Model.md` (`updateSalon` name + address required), `08-Decisions.md` #36 #42 #44 #46, `docs/adr/0032-owner-salon-catalog.md`, `docs/adr/0031-add-salon-requires-address.md`, `docs/adr/0025-self-serve-create-salon.md`.

- [x] One React PWA. Lazy owner chunk for edit. Lighthouse `/graphql` `updateSalon` only; no REST. `OwnerAccess::salon` for the write. No sibling `marketing/` — verify: Behat hits `/graphql`; this PR does not add `esyres_app/marketing` or a web.php route
- [x] i18next `bs` only. Six new `owner.*` keys listed above. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR edits schema/PHP/features → **Behat runs**. Do not change `behat.yml`. Do not add `/owner/salons/create` — verify: CONTEXT classifier at verify time; `App.tsx` has `:id` and does not register create

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

**This PR (2026-09-13):** Classifier ran Behat (PHP / `graphql/` / `features/`). Compose already up.

Passed:

```text
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

454 scenarios passed. 161 Vitest tests passed.

## Out of scope

- Add salon (`/owner/salons/create`, STORY-52)
- Hours / cancel window UI (STORY-53)
- Services UI (STORY-54)
- Workers UI (STORY-55)
- Current job labels on occupying cells (STORY-49)
- Delete salon; DND; photos; coordinates; reschedule cap
- Changing `/create-salon` copy, fields, or redirect
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-51.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-51-salon-edit` from current `master`.
3. **GraphQL:** `UpdateSalonInput` + `updateSalon` in `esyres_app/graphql/schema.graphql`. Class `App\GraphQL\Mutations\UpdateSalon`: `OwnerAccess::salon` then trim name/address; empty name → `INVALID_NAME`; empty address → `INVALID_ADDRESS`; save those two columns only. Do not touch hours/services/workers/`lat`/`lng`.
4. **Behat:** `features/owner/update_salon.feature` + OwnerSteps for the mutation. Cover success, guest, unverified, other user, missing id, blank name, blank address. Reuse existing public-address assertions so omit-when-missing still holds.
5. **PWA paths:** `ownerSalonEditPath(id)` in `owner.ts`. Lazy `OwnerSalonEdit` in `App.tsx` after `/owner/salons`. `ME_QUERY` `salons { address }`. Mutation next to other owner GraphQL (e.g. `graphql/auth.ts` or a small owner salons module — do not invent a second API client).
6. **Catalog:** name `Link` to edit path. Keep open-now as text. Flip the STORY-50 “no row links / no `:id` route” assertions.
7. **Edit page:** copy catalog shells. Resolve shop from `me.salons` only. OwnerNav like request detail (`salonId` = route id). Form matches CreateSalon field chrome (`border-hairline`, black `rounded-md` save) under the owner overlay (not the guest column). No hours/services/workers markup.
8. **Copy:** six keys only. Assert in `owner.test.ts`. Add `OwnerSalonEdit.tsx` to `topNav.source.test.ts` / `designPack.test.ts` / `authPlace.source.test.ts` owner file lists. `CreateSalon.tsx` untouched.
9. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-51.md` Loop to `STORY-51`.
10. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: Behat (schema/PHP/features).
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
