# Answer key: STORY-41

> Epic 7: self-serve create salon on the same account + listed discovery.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-41.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-41 |
| Source | `docs/stories/STORY-41.md` — Create salon and listed discovery |
| Goal (one sentence) | A signed-in verified user creates a salon by name on `/create-salon`, lands on `/owner`, and Nearby/Popular return only listed salons. |
| Branch name | `cursor/story-41-create-salon-3135` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk Hopic / 2026-09-11 |

## Pass/fail — product

- [x] `createSalonSurface(me)` is `auth` when `me` is null; `redirect-owner` when `me.salons.length > 0` (even if email unverified); `verify` when signed-in, no salons, `emailVerified` false; `form` when signed-in, verified, no salons — verify: Vitest
- [x] `ownerPanelCta(ownsSalon)` is `{ href: '/create-salon', kind: 'create' }` when false and `{ href: '/owner', kind: 'panel' }` when true — verify: Vitest
- [x] i18n `bs`: `createSalon.name` `Ime salona`; `createSalon.submit` `Otvori panel`; `createSalon.INVALID_NAME` `Unesi ime salona.`; `home.panel` `Panel`; `owner.createSalon` `Napravi salon`; brand on the page is `pitch.brand` `Esyres` — verify: Vitest
- [x] `CREATE_SALON_PATH` is `/create-salon`; `App.tsx` uses that constant as a route (not `/signup`, not under `/owner`) before the `*` catch-all; `/` stays `HomeGate`; no `/salons` this PR — verify: Vitest (`CREATE_SALON_PATH`) + `App.tsx` imports it
- [x] GraphQL `createSalon(name)` as a verified session user: same `users` row as `owner_id`; stored name is trimmed; hours closed all seven weekdays; `cancellation_notice_hours` 24; empty services; empty workers; `address`/`lat`/`lng` null — verify: Behat
- [x] `createSalon` guest → `UNAUTHENTICATED`; signed-in unverified (Behat `APP_ENV=testing`, not local skip) → `EMAIL_UNVERIFIED`; empty or whitespace name → `INVALID_NAME`; user who already owns a salon can still create another via the mutation — verify: Behat
- [x] Nearby and Popular omit a salon until it has ≥1 weekday with `closed: false` **and** ≥1 service. Nearby still requires `lat`/`lng`. Unlisted `salon(id)` still returns the row (not `UNAUTHENTICATED`/`FORBIDDEN`). Popular does not include factory-default `"Hidden"` — verify: Behat (`features/guest/salon_discovery.feature` plus listed/unlisted cases)
- [x] No `/signup`, waitlist, or Formspree — verify: `rg -n 'formspree|/signup|waitlist' esyres_app/frontend esyres_app/routes esyres_app/graphql` exits 1 (no matches)
- [ ] Sparse Design-1 on `/create-salon` (brand link to `/`, name field, black `rounded-md` CTA; no homepage header/footer, no feature grid, no owner-panel chrome) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Epic 7 `createSalon`), `04-Frontend.md` (`/create-salon`), `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #7 #43, `docs/adr/0025-self-serve-create-salon.md`, `docs/adr/0028-listed-salon-on-discovery.md`.

- [x] Lighthouse `/graphql` mutation only; no REST create-salon resource — verify: Behat hits `/graphql`; no new web.php create route
- [x] Sanctum session + existing `OwnerAccess::user` codes (`UNAUTHENTICATED` / `EMAIL_UNVERIFIED`); local `hasVerifiedEmail` skip unchanged — verify: Behat; `User::hasVerifiedEmail` untouched
- [x] Listed filter is shared by `salonsNearby` and `popularInSarajevo` (one helper/scope). No geocoding. `salon(id)` unfiltered — verify: Behat + both query classes call the helper
- [x] No STORY-40 homepage/`/salons`/HomeGate removal. No STORY-42 Design-2 delete. No Pest, Playwright, GraphQL codegen this PR — verify: `HomeGate` still on `/`; `refs/design-2` still present; `esyres_app/frontend/package.json` (no Playwright/RTL added)

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

Cloud Agent verify (2026-09-11): Docker missing. Host PHP 8.3 + host MySQL, `.env.behat` / `esyres_test` only (no `esyres` DB). Hostname `mysql` mapped to 127.0.0.1 for this VM. Frontend via host `npm` from `esyres_app/frontend/`.

Passed:

```text
php artisan --version
vendor/bin/behat --format=progress --stop-on-failure
```

From `esyres_app/frontend/`:

```text
npm run typecheck
npm run test
npm run build
```

## Out of scope

- STORY-40 homepage header, `/salons`, persist-seen removal, Pronađi salon navigation
- Wiring `ownerPanelCta` into a homepage header (STORY-40); this PR only ships the helper + `home.panel`
- Second salon from the homepage (STORY-04)
- Owner address / `lat`/`lng` editor; geocoding
- Hours, services, workers UI (STORY-01–03)
- Deleting Design-2 / owner light nav (STORY-42)
- Public pricing, waitlist, Formspree, `/signup`, invite-email onboarding UI
- `ALREADY_OWNS` on `createSalon`
- Playwright, RTL, Pest, GraphQL codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-41.md`, `docs/glossary.md` (**Create salon**, **Listed salon**, **Owner**), `docs/adr/0025-self-serve-create-salon.md`, `docs/adr/0028-listed-salon-on-discovery.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: keep `cursor/story-41-create-salon-3135`.
3. **GraphQL:** `createSalon(name: String!): Salon!` in `schema.graphql` + `App\GraphQL\Mutations\CreateSalon`. `OwnerAccess::user` then `Salon::query()->create(['owner_id' => $user->id, 'name' => trim($name)])` so model boot fills closed week / cancel 24 / dnd / reschedule_cap. Empty trim → `ClientError('INVALID_NAME')`. Do not reject when the user already owns a salon. Do not set address/coords/services/workers.
4. **Listed:** one PHP helper (e.g. `App\Discovery\ListedSalon::constrain($query)`) applied in `SalonsNearby` and `PopularInSarajevo` after existing coord/page/filter logic. Predicate: `whereHas('services')` and at least one weekday JSON `closed` is false (`WeeklyHours::WEEKDAYS`). Do not filter `salon(id)`. No `listed` GraphQL field this PR.
5. **Behat:** `features/guest/create_salon.feature` for mutation product checks. Update `features/guest/salon_discovery.feature`: any salon expected in Nearby/Popular must fixture one open weekday + one service (reuse `the salon is open …` + service steps). Add: closed+service omitted; open+no service omitted; open+service listed; unlisted still returned by `salon(id)`; `"Hidden"` absent from Popular. Guest suite still English Gherkin, GraphQL-over-HTTP, Sanctum CSRF.
6. **Frontend helpers** (`esyres_app/frontend/src/lib/createSalon.ts` + test): export `CREATE_SALON_PATH = '/create-salon'`; `createSalonSurface`; `ownerPanelCta`. Vitest covers every Vitest product check. i18n keys exactly as in the product checks. No RTL, no Playwright.
7. **`/create-salon` page:** React route in `App.tsx` using `CREATE_SALON_PATH` before `*`. `useQuery(ME_QUERY)`. Surfaces from `createSalonSurface`: `AuthShell` (`allowRegister` true); `EmailVerifyPanel`; `<Navigate to="/owner" replace />`; form with brand `Link` to `/` (`pitch.brand`), name input, submit `Otvori panel` (`rounded-md` black CTA like pitch, not owner pill). On success `navigate('/owner')`. Map `INVALID_NAME` to `createSalon.INVALID_NAME`. No homepage header/footer, no feature grid, no `OwnerNav`.
8. **`OwnerHome` only:** when `salon === null`, keep `owner.notOwner` and add `Link` to `CREATE_SALON_PATH` with `t('owner.createSalon')` (`Napravi salon`). Do not add the form on `/owner`. Leave other owner routes’ not-owner paragraph as-is.
9. **Do not:** remove `HomeGate`; add `/salons`; change pitch seen storage; delete `refs/design-2`; geocode; add waitlist/Formspree/`/signup`. Optional one-line: `.cursor/rules/backend/api-conventions.mdc` “invite-only” → self-serve create salon (ADR 0025) if you touch that file.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate. Human-only Design-1 look is merge, not a ready gate.
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
