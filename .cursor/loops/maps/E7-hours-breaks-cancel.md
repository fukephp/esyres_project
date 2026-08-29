# Story map: E7-hours-breaks-cancel

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-hours-breaks-cancel |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to set my working hours, breaks, and cancellation notice window, so that the system reflects how my salon actually runs.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E7-hours-breaks-cancel.md` |

## Destination

An owner can persist weekly working hours, breaks, and `cancellation_notice_hours` on a salon they own, so later discovery and the panel read real salon time rules — not placeholders.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/07-Stories.md` Epic 7, `docs/architecture/` (03, 04, 05, 06, 07, 08)
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today (`esyres_app/`): Laravel 13 skeleton, empty Behat, throwaway PWA, no Lighthouse, no Sanctum, no Salon, no `/graphql`, no `/owner`, slim compose (`php` + `node` only). `phpunit.xml` uses sqlite `:memory:` but the backend gate is Behat, not PHPUnit. GraphQL features land with Lighthouse (`docs/architecture/03-Backend.md`).
- Design 2 specifies owner panel density, not an hours-settings screen.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not expand into services, workers, panel, or Epic 1 profile
  - Invite-only: no public “Register salon”

## Decisions so far

- Epic 7 first story only: working hours, breaks, cancellation notice window (story text). Same settings area in `docs/mvp/03-Key-Features.md` also names holidays and reschedule cap — not assumed in this PR until grilled.
- Owner access = user who owns at least one salon. No public owner signup. Invite provisions salon + owner (`docs/architecture/06-Auth-Notifications-Realtime.md`, `03-Backend.md`).
- Owner mutations require verified email plus salon policy. Workers are not users; they inherit salon hours (no per-worker shift editor this epic).
- `cancellation_notice_hours` lives on **Salon**. Late cancel warns; it does not hard-block (`docs/mvp/03-Key-Features.md`).
- Stack for any API: Lighthouse code-first `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP. Not Pest, not `php artisan test` as the gate.
- `APP_TIMEZONE=Europe/Sarajevo`. Calendar days are Sarajevo dates.
- Owner home is the Worker Availability Panel, not settings (`docs/mvp/04-UI-Design-Goals.md`). This story is settings, not the panel.
- **Slice (2026-08-29):** this PR is a **backend vertical**. Add Lighthouse + Sanctum + Salon. Owner writes working hours, breaks, and `cancellation_notice_hours` via GraphQL; Behat is the owner. Founder provision = Behat/artisan fixture (verified-email owner + salon). No invite emails. No `/owner` UI, no React Router / Apollo / product chrome. PWA stays the throwaway placeholder.
- **Hours shape (2026-08-29):** Mon–Sun. Each day is `closed` or one `opens_at`/`closes_at` in Sarajevo local time, 15-minute steps (panel grid). Overnight intervals out. A closed weekday is hours, not a holiday.
- **Breaks shape (2026-08-29):** optional one break per open weekday (`break_starts_at` / `break_ends_at`), must lie inside that day’s open interval. Closed days have no break. Saturday may differ from Monday.
- **Holidays and reschedule cap (2026-08-29):** out of this PR. Closed weekdays ≠ holidays. Reschedule cap stays Epic 5.
- **Default cancellation notice (2026-08-29):** `cancellation_notice_hours` defaults to **24** on a new salon.
- **Behat database (2026-08-29):** add **mysql** to slim compose this PR. Behat uses a dedicated MySQL test DB, fresh migrate per scenario. Not sqlite. Not nginx/redis/reverb/mailpit. ADR: `docs/adr/0001-mysql-in-slim-compose.md`.
- **Behat auth (2026-08-29):** GraphQL `login(email, password)` → Sanctum session cookie. Fixture creates the owner (password + `email_verified_at`). No public register, no owner signup this PR. Password login allowed while unverified; hours mutation still requires `email_verified_at` plus owning the salon.
- **Empty week (2026-08-29):** a newly provisioned salon is closed all seven days until the owner writes hours. Happy-path Behat sets the week in Gherkin.
- **Write shape (2026-08-29):** one owner mutation replaces the whole weekly template (hours + optional per-day break) and `cancellation_notice_hours`. `opens_at` inclusive, `closes_at` exclusive, Sarajevo local, 15-minute steps.
- **Read this PR:** owner can query their salon’s hours/breaks/notice window (Behat reads back). Public salon profile is Epic 1 — not this PR.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Epic 7 services, workers, salon switcher
- Epic 1 customer salon profile (display of hours)
- Epic 3 Worker Availability Panel as home
- Epic 10 assistant / after-hours DND
- Public owner registration
- Phase 2: per-worker vacation, buffer time, chain multi-location
- Holiday calendar and reschedule cap (later Epic 7 / Epic 5)
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless the slice forces a named piece
- Native apps, payments, worker logins
