# Answer key: STORY-44

> Epic 1: idle `/salons` is a short discovery teaser; chip, name, or show all opens richer hairline results.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-44.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-44 |
| Source | `docs/stories/STORY-44.md` — Discovery teaser and richer results |
| Goal (one sentence) | Idle `/salons` shows three Nearby-or-Popular cards; a chip, name search, or Prikaži sve replaces that teaser with hairline rows that share name, today’s busy-level, categories, and address when set. |
| Branch name | `story/STORY-44-discovery-teaser` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-12 |

## Pass/fail — product

- [x] `discoveryListMode({ filtered, showAll })` is `teaser` only when both are false; otherwise `results`. `discoveryVisibleSalons(salons, 'teaser')` is the first 3; `'results'` is the full array. `discoveryShowAllVisible(listedCount, mode)` is true only when `listedCount >= 4` and mode is `teaser` — verify: Vitest (`esyres_app/frontend/src/lib/discovery.ts`)
- [x] `discoverySalonCategories(services)` returns unique `ServiceCategory` values in `DISCOVERY_CATEGORIES` order (`HAIR`, `MAKE_UP`, `MASSAGE`); duplicates collapse; unknown categories omitted — verify: Vitest
- [x] Address omit reuses `assistantAddressLine`: null / undefined / blank / whitespace → `null`; a set string is trimmed and kept — verify: Vitest (existing `assistant.test.ts` plus discovery helper that calls it)
- [x] i18n `bs`: existing `discovery.nearby` / `popular` / `emptyNearby` / `emptyPopular` / `emptyFiltered` / `searchPlaceholder` unchanged. New `discovery.showAll` is `Prikaži sve`. No `Rezultati` heading key. Category labels stay `category.HAIR|MAKE_UP|MASSAGE`. Busy labels stay `salon.busy.LOW|MEDIUM|HIGH` — verify: Vitest
- [x] Filtered empty still uses `discoveryEmptyKey(source, true)` → `discovery.emptyFiltered`. Unfiltered empty still uses nearby/popular keys. Geo grant/deny source helpers unchanged — verify: Vitest (existing `discovery.test.ts`)
- [x] Handwritten `SALONS_NEARBY_QUERY` / `POPULAR_IN_SARAJEVO_QUERY` select `id`, `name`, `address`, `busyLevel(date: $date)`, `services { category }`. `$date` is passed from `sarajevoToday()`. No new root list query — verify: Vitest asserts query documents contain those fields; `graphql/schema.graphql` still has only `salonsNearby` and `popularInSarajevo` as list queries
- [x] Guest GraphQL: a listed salon with address `"Ferhadija 12"`, a HAIR service, and a MAKE_UP service returns those facts on **both** `popularInSarajevo` and `salonsNearby` (`busyLevel` for a closed-week date is `LOW`). STORY-06 category/name AND rules still pass — verify: Behat (`features/guest/salon_discovery.feature`; existing filter scenarios unchanged)
- [x] `DiscoveryHome.tsx`: idle unfiltered list uses `bg-surface-card rounded-lg` cards; filtered or show-all uses `divide-hairline` rows (not cards). Search input has `rounded-md` and `py-3` plus an inline SVG (no lucide/heroicons import). `Prikaži sve` is not `bg-ink`. Brand `Link` + `BookingsLink` stay. Heading uses `discovery.nearby` / `discovery.popular` only — verify: grep those class names / keys in `DiscoveryHome.tsx`; `package.json` has no new icon dependency
- [ ] Teaser cards vs hairline results read as two modes (grey cards, then rows) with the same facts — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Epic 1 public lists + server `busyLevel`), `04-Frontend.md` (discovery teaser then results), `05-Data-Model.md`, `08-Decisions.md` #45, `docs/adr/0030-discovery-teaser-then-results.md`.

- [x] No third list query, no `categories` field on `Salon`, no REST, no Scout/Meilisearch. Filters stay optional args on the existing two queries — verify: schema; Behat still hits `/graphql`; no `laravel/scout`
- [x] `SalonsNearby` and `PopularInSarajevo` eager-load `services` (`with('services')`). Occupancy/`busyLevel` stays per-salon. List paging still default 20 / cap 50 — verify: both query classes; existing Behat `INVALID_PAGE` scenarios
- [x] Sanctum cookies, not Bearer. No Pest. Behat flags CLI-only; do not change `behat.yml` — verify: Behat guest steps; no `pestphp`; `behat.yml` unchanged
- [x] No Playwright, RTL, GraphQL codegen, extra search/icon npm this PR. No STORY-43 shared top-nav. No owner address editor — verify: `esyres_app/frontend/package.json`; no `TopNav` component added this PR

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0 before the loop may open a ready PR.

Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Shared Cal top-nav / dropping in-page `BookingsLink` (STORY-43)
- Photos, km, maps, from-price, hours on the row, trust-badge display
- URL query params, pagination UI, Popular ranking, typeahead, search-by-service-name
- Owner address / coords editor, geocoding
- Dynamic category chips (still open in mvp 08)
- Awwwards / GSAP; Booksy/Fresha photo cards
- Changing STORY-06 GraphQL filter rules
- Playwright, RTL, Pest, GraphQL codegen, extra search or icon npm pack
- A new `categories` field or third list query

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-44.md`, `docs/glossary.md` (**Discovery teaser**, **Discovery results**, **Show all**, **Discovery filter**, **Busy-level**), `docs/adr/0030-discovery-teaser-then-results.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: `story/STORY-44-discovery-teaser`.
3. **Helpers** (`esyres_app/frontend/src/lib/discovery.ts` + `discovery.test.ts`): `discoveryListMode`, `discoveryVisibleSalons`, `discoveryShowAllVisible`, `discoverySalonCategories`. Reuse `assistantAddressLine` for the address line. Keep existing `discoverySource` / `discoveryHasFilter` / `discoveryEmptyKey`.
4. **GraphQL PWA:** add `$date: String!` and the extra fields to both handwritten list queries. Pass `date: sarajevoToday()`. Types include `address`, `busyLevel`, `services: { category }[]`.
5. **Backend:** `SalonsNearby` and `PopularInSarajevo` `->with('services')`. Do not add schema fields. Do not change `ListFilter` / listed gate / paging.
6. **Behat:** keep the default name-only list queries for existing scenarios. Add a richer query (or extra When) plus Then assertions for address, `busyLevel`, and unique categories on one listed salon for both nearby and popular. Fixture: listed + coords + address `"Ferhadija 12"` + HAIR and MAKE_UP services. Date can be any valid Y-m-d (closed week → `LOW`). Do not rewrite STORY-06 filter scenarios.
7. **PWA `DiscoveryHome`:** local `showAll` boolean, cleared when filters turn off. Idle unfiltered: first 3 as `bg-surface-card rounded-lg` cards (name, profile busy chrome, muted category labels, address if set); 4+ → text `Prikaži sve` under the cards (not `bg-ink`). Chip or debounced name, or show-all, switches to `divide-hairline` rows with the same facts. Filtered empty: chips + search stay, `Nema rezultata.` Heading stays nearby/popular. Search: inline SVG, `rounded-md py-3`, placeholder `Ime salona`. Leave brand + `BookingsLink`. Geo pending still `salon.loading`. No URL params.
8. **Copy:** informal *ti*. `discovery.showAll` = `Prikaži sve`. Do not add English chrome.
9. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-44.md` Loop to `STORY-44`.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots. Do not type credentials into the IDE browser.
12. After PR: trivial Bugbot nits on the same PR (do not burn the cap). If Bugbot contradicts this key, stop and ask.
