# Story map: STORY-58

> Wayfinder-lite planning artifact. Copy to `.cursor/loops/maps/STORY-xx.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-58 |
| Source | `docs/stories/STORY-58.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-58.md` |

## Destination

Owners name salon-owned service categories on Usluge and attach services to the selected group. Guest `/salon/:id` idle + picker group under those headings (`md+` jump list when ≥2 visible). Discovery chips stay Kosa / Šminka / Masaža via a migrate-only legacy key. HAIR / MAKE_UP / MASSAGE is gone from Service.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-58.md`, `docs/adr/0033-salon-service-categories.md`, `docs/architecture/05-Data-Model.md`, `docs/architecture/04-Frontend.md`, `docs/architecture/08-Decisions.md` #47, `docs/glossary.md` (service category vs discovery chip), `docs/stories/STORY-02.md` / `STORY-54.md` (duration/price rules + Usluge chrome)
- Skills: `.cursor/skills/custom-feature-skills/SKILL.md`; grilling rounds for open decisions
- Standing preferences: dense owner chrome; no `<select>` on salon edit; KM in UI / feninga on the wire; i18next `bs` only; Behat is the backend gate
- Verify will **not** skip Behat
- Grill 2026-09-15: round 1 Q2–Q6 as recommended; Q1 product = owner-named groups, no forced unused buckets. Round 2: no GraphQL chip enum (filter via services → `legacy_key`); Q7–Q9 as recommended.

## Decisions so far

- Product and data model from ADR 0033 / STORY-58 / architecture #47: salon-owned named group; service belongs to exactly one, required; enum gone from Service.
- Discovery chips stay Kosa / Šminka / Masaža (PWA `DISCOVERY_CATEGORIES` + `category.HAIR` copy). No GraphQL `enum ServiceCategory`. Nearby/popular `category` arg is `String`. `ListFilter` matches through **services** whose category `legacy_key` equals that string. Owner never sees or sets the key. Owner-created names with no key do not hit chips. No secret map of owner names onto HAIR/MAKE_UP/MASSAGE.
- Owner Usluge: list of this salon’s groups; services of the **selected** group; add category, then add service into the selected one. Zero categories → add-category only (no add-service). Rename yes. Empty groups allowed. Delete only when empty. Empty name and duplicate name on the same salon rejected. Create order (`id` asc), no drag. Move a service by picking another of this salon’s groups. Duplicate service names stay salon-wide. Same duration/price rejection as STORY-02 / STORY-54.
- Guest `/salon/:id` idle and picker: one column, heading per group with ≥1 service. `md+` jump list (right) only when ≥2 visible groups; one visible group still shows the heading, no jump list. Empty groups hidden on guest, visible on owner. Jump is not an exclusive filter. Chat stays a flat name list. `/salons` teaser/results show that salon’s group **names** (not enum labels).
- Migrate: per salon, one group per distinct enum actually used (names Kosa / Šminka / Masaža + that legacy key); point those services at it. Salon with no services gets no groups. Demo seed follows the same model.
- Listed still means one open weekday + ≥1 service (`ListedSalon` `whereHas('services')`). No platform catalog. No delete/deactivate service.
- **Q1 (product)** Owner has full control of groups. Do not seed unused hair/makeup/massage buckets. Not a salon-level exclusive type.
- **Q1 (GraphQL)** Type `SalonServiceCategory` (`id`, `name`; no `legacyKey` on the wire). Drop `Service.category`. Add `Service.serviceCategory`. Mutations: `createSalonServiceCategory` / `updateSalonServiceCategory` / `deleteSalonServiceCategory(id): Boolean!`. Service writes take `serviceCategoryId`. `legacyKey` SQL-only.
- **Q2** `Salon.serviceCategories` in create order, each with `services`. Keep `Salon.services` as the flat list (chat + listed). Same shape on public `salon` and `me.salons`. Guest UI hides empty groups; API still returns them.
- **Q3** First group in create order when opening Usluge. After create, select the new group. After delete, first remaining, or none.
- **Q4** Clickable name buttons in create order (OwnerNav tokens: selected `font-semibold text-ink`, idle `text-body`). Not radios, not a fifth salon-edit chip, not `<select>`.
- **Q5** Show Obriši only when the selected group has 0 services. No disabled control. Server still rejects a race (`CATEGORY_NOT_EMPTY`).
- **Q6** Heading `id={`svc-cat-${id}`}` + `<a href="#svc-cat-${id}">`. CSS-hide the list below `md`. Hash may appear in the URL; do not treat it as a filter or a route.
- **Q7** Existing row: radios of this salon’s category names. Checked = current group. Spremi sends the new `serviceCategoryId`. One group only → omit radios. Add form has no category field (uses selected). No `<select>`.
- **Q8** `INVALID_NAME` (empty/blank category name). `DUPLICATE_CATEGORY_NAME`. `CATEGORY_NOT_EMPTY`. `INVALID_CATEGORY` (missing, other salon, or create-service with no selected group). Auth: `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `FORBIDDEN`. Duration/price/`DUPLICATE_SERVICE_NAME` unchanged.
- **Q9** `owner.categoryName` `Ime kategorije`; `owner.addCategory` `Dodaj`; `owner.deleteCategory` `Obriši`; `owner.INVALID_CATEGORY_NAME` `Unesi ime kategorije.`; `owner.DUPLICATE_CATEGORY_NAME` `Kategorija s tim imenom već postoji.`; `owner.CATEGORY_NOT_EMPTY` `Prvo premjesti ili obriši usluge.`; `owner.INVALID_CATEGORY` `Odaberi kategoriju ovog salona.` Empty selected group reuses `salon.emptyServices`. Reuse `owner.save` / `owner.addService`. Map server `INVALID_NAME` on category mutations → `owner.INVALID_CATEGORY_NAME`.

## Open decisions

- (empty)

## Not yet specified

- (empty)

## Out of scope

- Dynamic discovery chips (mvp 08)
- Profile service search, Detaljnije, drag reorder, photos, descriptions, packages
- Chat grouped by category
- Delete category that still has services; delete/deactivate service
- Platform category catalog; dual taxonomy (hidden enum on the service)
- Worker↔service assignment matrix
- Playwright, RTL, Pest, GraphQL codegen, new npm
