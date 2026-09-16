# Answer key: STORY-58

> Epic 7: salon-owned service categories replace HAIR / MAKE_UP / MASSAGE on Service.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-58.md` (compiled). Locks from `docs/stories/STORY-58.md`, ADR 0033, and the story-loop grill (Q1–Q9).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-58 |
| Source | `docs/stories/STORY-58.md` — Owner service categories |
| Goal (one sentence) | Owners name salon-owned service categories and attach services to the selected group, so the guest menu matches the real cjenovnik instead of locked hair / make-up / massage. |
| Branch name | `story/STORY-58-service-categories` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-15 |

## Pass/fail — product

- [x] Table `service_categories`: `salon_id`, owner-typed `name`, nullable `legacy_key` (`HAIR` / `MAKE_UP` / `MASSAGE` only). Unique `(salon_id, name)`. Unique `(salon_id, legacy_key)` where key is not null. Create order = `id` asc. `services.category` column is gone; `services.service_category_id` required FK (restrict on delete). Service still has `salon_id` + unique `(salon_id, name)` — verify: Behat (migrate + `features/owner/salon_service_categories.feature` + rewritten `features/owner/salon_services.feature`)
- [x] GraphQL: delete `enum ServiceCategory`. Type `SalonServiceCategory { id name services }`. `Service` has `serviceCategory` (no `category`). `Salon.serviceCategories` (create order, nested `services`) and keep `Salon.services` flat. Nearby/popular `category: String`. `createSalonServiceCategory(salonId, input: { name })` / `updateSalonServiceCategory(id, input: { name })` return the type; `deleteSalonServiceCategory(id): Boolean!`. `CreateSalonServiceInput` / `UpdateSalonServiceInput` use `serviceCategoryId: ID!` instead of `category` — verify: Behat (schema via those features; GuestSteps nearby/popular queries use `$category: String`)
- [x] Category create/rename/delete: verified owner who owns the salon. Trim name; empty → `INVALID_NAME`; duplicate on same salon → `DUPLICATE_CATEGORY_NAME`; delete with ≥1 service → `CATEGORY_NOT_EMPTY` and row remains. Guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`; other user → `FORBIDDEN`. Owner never reads or writes `legacyKey` — verify: Behat (`salon_service_categories.feature`)
- [x] Service create/update: same duration/price/`DUPLICATE_SERVICE_NAME` as STORY-02. `serviceCategoryId` missing, other salon, or unknown → `INVALID_CATEGORY`. Auth codes unchanged — verify: Behat (`salon_services.feature`)
- [x] Migrate: per salon, one category per distinct **used** `services.category` (HAIR→Kosa, MAKE_UP→Šminka, MASSAGE→Masaža + that `legacy_key`); point those services at it. Salon with no services gets no categories. Do not seed unused buckets. `LocalDemoSeeder` + `ServiceFactory` + Behat `the salon has a service` fixture follow that (fixture JSON `category` is the legacy key used to firstOrCreate the group) — verify: Behat (existing service fixtures still green; demo seeder creates keyed groups then services; a massage-only salon has no Hair/Šminka group)
- [x] Chip filter: PWA still three chips (`DISCOVERY_CATEGORIES` + `t('category.HAIR'|MAKE_UP|MASSAGE)`). Query sends `String` `HAIR` / `MAKE_UP` / `MASSAGE`. `ListFilter` `whereHas` **services** whose category `legacy_key` matches. Owner-created group with null key does not match. Discovery teaser/results show `serviceCategories` **names** in create order (not enum labels). `ListedSalon` still `whereHas('services')` — verify: Behat (`salon_discovery.feature` category filter + facts names `["Kosa", "Šminka"]`); Vitest (`discovery.test.ts` names helper; chips still three)
- [x] Usluge (`OwnerSalonEdit` services panel): clickable category name buttons in create order (selected `font-semibold text-ink`, idle `text-body`). Default selected = first group; after create select the new one; after delete first remaining or none. Rename field + Spremi on selected. Obriši only when selected has 0 services (copy `owner.deleteCategory`). Zero groups → add-category form only, no add-service. Selected group’s services + add form (no category field; send selected id). Existing row: radios of this salon’s names when ≥2 groups; Spremi sends `serviceCategoryId`. One group → omit radios. No `<select>`. No discovery-chip radios. Map `INVALID_NAME` → `owner.INVALID_CATEGORY_NAME`; also `owner.DUPLICATE_CATEGORY_NAME` / `CATEGORY_NOT_EMPTY` / `INVALID_CATEGORY`. Empty selected group reuses `salon.emptyServices`. CreateSalon / OwnerSalonCreate still have no services UI — verify: Vitest reading `OwnerSalonEdit.tsx` + `owner.test.ts` i18n; flip `ownerSalons.source.test.ts` service `category` / `DISCOVERY_CATEGORIES` radios
- [x] Guest `/salon/:id` idle and picker share one grouped column: heading per `serviceCategories` with ≥1 service (`id={`svc-cat-${id}`}`); row is name + duration + price (no `t('category.*')` on the row). Empty groups omitted. One visible group: heading, no jump nav. ≥2 visible: `hidden md:block` right `<nav>` of `<a href="#svc-cat-${id}">` (not a filter, not a route). Chat stays flat `salon.services` names. Public query adds `serviceCategories { id name services { … } }` and keeps flat `services` for chat — verify: Vitest reading `SalonProfile.tsx` + `salon.ts`; Behat public salon drops `category` on Service and can read `serviceCategories { name }`
- [x] New i18n `bs` keys only: `owner.categoryName` `Ime kategorije`; `owner.addCategory` `Dodaj`; `owner.deleteCategory` `Obriši`; `owner.INVALID_CATEGORY_NAME` `Unesi ime kategorije.`; `owner.DUPLICATE_CATEGORY_NAME` `Kategorija s tim imenom već postoji.`; `owner.CATEGORY_NOT_EMPTY` `Prvo premjesti ili obriši usluge.`; `owner.INVALID_CATEGORY` `Odaberi kategoriju ovog salona.` Keep `category.HAIR` / `MAKE_UP` / `MASSAGE` for chips — verify: Vitest (`owner.test.ts` `i18n.t`)
- [ ] Guest grouped menu + `md+` jump list (hidden on small viewports; hash is not a filter) — verify: human-only: visual at merge (not a PR screenshot gate)
- [ ] Usluge selected-group chrome (name buttons, Obriši only when empty, add-service only with a selection) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Lighthouse `/graphql`, Behat gate), `04-Frontend.md` (grouped salon profile, discovery category names), `05-Data-Model.md` (service category + no enum on Service), `08-Decisions.md` #47, `docs/adr/0033-salon-service-categories.md`.

- [x] One React PWA. Lighthouse GraphQL only; no REST; no sibling `marketing/` — verify: Behat hits `/graphql`; PR does not add `esyres_app/marketing`
- [x] i18next `bs` only. Integer feninga on the wire. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR edits schema/PHP/migrations/features → **Behat runs**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story adds GraphQL + PHP + migrations + Behat. Expected: classifier **fails** → full Behat set.

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

**This PR (2026-09-16):** Classifier ran Behat (PHP / `graphql/` / `features/` / migrations). Compose already up.

Passed:

```text
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

473 Behat scenarios passed. 174 Vitest tests passed.

## Out of scope

- Dynamic discovery chips (mvp 08); removing the three chips
- Profile service search, Detaljnije, drag reorder, photos, descriptions, packages
- Chat grouped by category
- Delete category that still has services; delete/deactivate service
- Platform category catalog; dual taxonomy (hidden enum on the service)
- Worker↔service assignment matrix
- `legacyKey` on any GraphQL type
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-58.md`, `docs/adr/0033-salon-service-categories.md`, `docs/architecture/04-Frontend.md`, `docs/architecture/05-Data-Model.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-58-service-categories` from current `master`.
3. **Schema + PHP:** drop GraphQL enum `ServiceCategory`. Add `SalonServiceCategory` + mutations above. Nearby/popular `category: String`. `ListFilter` joins services → `legacy_key`. Restrict delete when services exist. `OwnerAccess` same as other salon writes.
4. **Migrate** existing `services.category` as specified. Update `LocalDemoSeeder`, `ServiceFactory`, `SharedFixtures::theSalonHasAService` (JSON `category` → firstOrCreate keyed group). Rewrite `salon_services.feature` queries/mutations to `serviceCategoryId` / no `category` field. Add `features/owner/salon_service_categories.feature`. Guest discovery/profile queries: `$category: String`; facts use `serviceCategories { name }`.
5. **PWA:** `ME_QUERY` + public salon + discovery queries as product checks. Usluge panel per Q3–Q5/Q7/Q9. Guest idle+picker grouping + jump nav. Chat still maps `salon.services` names. Chips keep `DISCOVERY_CATEGORIES` (TS union, not GraphQL enum).
6. **Copy:** seven new `owner.*` keys. Keep chip `category.*` keys. Assert in `owner.test.ts`.
7. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-58.md` Loop to `STORY-58`.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: **Behat runs**.
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
