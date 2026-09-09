# Answer key: STORY-38

> Epic 7 local stand-in for founder provision: `LocalDemoSeeder` so a founder can log in as owner and customer and see data.
> Sharp path (no map). Do not implement (Local or Cloud) until a human has approved this file.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-38 |
| Source | `docs/stories/STORY-38.md` — Local demo seed |
| Goal (one sentence) | Local `migrate:fresh --seed` provisions three known logins, three open Sarajevo salons, and four guest bookings on the primary salon; `DatabaseSeeder` throws outside `local`; Behat calls `LocalDemoSeeder` directly. |
| Branch name | `story/STORY-38-local-demo-seed` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-09 |

## Pass/fail — product

- [x] `DatabaseSeeder` throws when `APP_ENV` is not `local` (Behat is `testing`) — verify: Behat (`features/owner/local_demo_seed.feature`)
- [x] After `LocalDemoSeeder`: `owner@esyres.test`, `guest@esyres.test`, `owner2@esyres.test` exist; password `password`; `owner@` owns two salons; `owner2@` owns one; `guest@` owns none — verify: Behat
- [x] All three salons have Sarajevo `lat` and `lng`, a week that is not `closedWeek()`, ≥1 worker, ≥1 service; across the set, service categories include `HAIR`, `MAKE_UP`, and `MASSAGE`; names and `price_feninga` are fixed literals — verify: Behat
- [x] Primary salon of `owner@` has exactly four bookings for `guest@`, dates relative to `now()` (Sarajevo): two `requested`, one `time_proposed` (`proposed_starts_at` + `proposed_worker_id`), one `confirmed` (`worker_id`) — verify: Behat
- [x] Second salon of `owner@` has zero bookings — verify: Behat
- [x] New salon via factory/`creating` is still closed all week, empty services, empty workers — verify: Behat (existing “New salon is closed…” plus this feature does not change factory defaults)
- [x] `esyres_app/README.md` lists the three emails, `password`, and `migrate:fresh --seed` — verify: file already persisted; keep it on the PR

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `05-Data-Model.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md` #7 (invite-only owners).

- [x] Behat stays per-scenario truncate + Gherkin fixtures; other features do not call `LocalDemoSeeder` or `db:seed` — verify: only `features/owner/local_demo_seed.feature` invokes the demo seeder; `artisan db:seed` is not a BeforeScenario
- [x] `LocalDemoSeeder` has no env guard (Behat can run it); `DatabaseSeeder` throws unless local, then calls `LocalDemoSeeder` — verify: Behat + seeder classes
- [x] No Pest; backend gate remains Behat — verify: no `pestphp` require
- [x] No public “Register salon”; invite-only onboarding unchanged — verify: no new register-salon mutation/route
- [x] No Playwright, codegen, `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`

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

- Staging/prod seed
- Behat shared seeded DB
- Invite-email UI; public “Register salon”
- Assistant intakes
- Photos, QR, push
- Declined / expired rows
- Changing invite-only owner onboarding
- Changing factory / creating defaults for a newly provisioned salon
- PWA UI, Pest, Playwright, codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-38.md`, `docs/architecture/03-Backend.md`, `05-Data-Model.md`, `07-Docker-and-Local-Dev.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch: `story/STORY-38-local-demo-seed`.
3. **`DatabaseSeeder`:** if `! app()->environment('local')`, throw (clear message: seed is local-only). Else `$this->call(LocalDemoSeeder::class)`. Remove the Laravel `test@example.com` user. Do not put the env guard on `LocalDemoSeeder`.
4. **`LocalDemoSeeder`:** fixed literals only (Bosnian names, integer feninga). Password `password`. Users: `owner@esyres.test` (two salons), `guest@esyres.test` (customer, no salons), `owner2@esyres.test` (one salon). All three salons: Sarajevo lat/lng (distinct enough for nearby), weekly hours with at least one open weekday (15-minute steps; not `WeeklyHours::closedWeek()`), ≥1 worker, ≥1 service. Across salons, include `HAIR`, `MAKE_UP`, `MASSAGE`. Primary salon (first owned by `owner@`, `id` ASC): four bookings for `guest@` relative to `now()` in `Europe/Sarajevo` — 2× `requested` (worker optional), 1× `time_proposed` (`proposed_starts_at` + `proposed_worker_id`), 1× `confirmed` (`worker_id`). Each booking has a `BookingService` snapshot. Second salon of `owner@`: zero bookings. No `AssistantIntake`. No `declined`. Do not change `SalonFactory` / `ServiceFactory` / `WorkerFactory` defaults.
5. **Behat** (`features/owner/local_demo_seed.feature`, English Gherkin): AfterScenario truncate still applies. Scenario A: instantiate `DatabaseSeeder` and assert it throws in testing. Scenario B: instantiate `LocalDemoSeeder`, `run()`, assert the product-check shape (counts, emails, `Hash::check('password', …)`, coords, not-closed hours, categories, four statuses + proposed/confirmed worker fields, second salon booking count 0). Optional: GraphQL login as `owner@` / `guest@` with `password`. Do not call `artisan db:seed` from BeforeScenario. Do not change `behat.yml`. Keep existing “New salon is closed all week” green.
6. Keep persisted docs on this PR if they are not already on the branch: `docs/stories/STORY-38.md`, catalog row, `esyres_app/README.md` Local demo seed, `docs/architecture/07-Docker-and-Local-Dev.md` local-seed bullet. Do not edit `docs/mvp/`, glossary, ADRs, or CONTEXT.
7. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate. Not a UI story — no screenshots.
8. On success: ready PR linking this key; list commands run. On escalate: draft/blocked PR with failing checks.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
