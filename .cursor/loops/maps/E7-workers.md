# Story map: E7-workers

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-workers |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to add workers to my salon, so that customers can request them specifically or leave it open. Workers follow the salon’s hours.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E7-workers.md` |

## Destination

A verified owner can persist named workers on a salon they own via GraphQL, so later Epic 2 worker pick and Epic 3 panel rows read a real list — not placeholders. Workers are salon rows, not users. They inherit salon hours (no per-worker hours). A new salon has zero workers.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/07-Stories.md` Epic 7, `docs/architecture/` (03, 04, 05, 08), `docs/glossary.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today (`esyres_app/`): Lighthouse `/graphql`, Sanctum cookies, `Salon` + hours + services mutations, Behat GraphQL-over-HTTP on MySQL. No `Worker` model. PWA still throwaway (no Router / Apollo / i18n / `/owner`).
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not expand into assignment, panel, public profile, or owner UI
  - Invite-only: no public “Register salon”

## Decisions so far

- Epic 7 this story only: add workers so customers can request them (story text). Worker↔service assignment, photos, bios, and panel rows are not assumed.
- Owner access = user who owns the salon. Mutations require verified email plus owning the salon (same policy as hours/services).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL test DB. Not Pest, not `php artisan test` as the gate.
- Worker is not a User and has no login (architecture decision 3).
- Workers inherit salon hours (architecture decision 34). No hours/shift/vacation columns or mutations on Worker.
- “No preference” is a later booking field (`worker_id` null), not a sentinel Worker row.
- **Slice (2026-08-29):** this PR is a **backend vertical**. Owner creates and updates workers via GraphQL; Behat is the owner. No `/owner` UI, no React Router / Apollo / product chrome. PWA stays the throwaway placeholder.
- **Write shape (2026-08-29):** per-worker mutations, not replace-all. `createSalonWorker(salonId, input)` and `updateSalonWorker(id, input)`. Input: `name`. Owner queries `salon { workers { … } }` to read back.
- **Empty roster (2026-08-29):** a newly provisioned salon has zero workers until the owner adds them.
- **Name (2026-08-29):** required non-empty; unique per salon.
- **Order (2026-08-29):** insertion order (`id` / `created_at`). No reorder API this PR.
- **Assignment (2026-08-29):** named workers only. No `worker_service` pivot this PR. Assignment lands when Epic 2 must filter workers by selected services.
- **Active (2026-08-29):** no `active` flag, no delete/deactivate this PR. Story is add (plus rename). Hide-from-picker later.
- **Read this PR:** owner can query their salon’s workers (Behat reads back). Public salon profile is Epic 1 — not this PR.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Owner settings UI (`/owner`), React Router, Apollo, i18next, Design 2 chrome
- Epic 1 customer salon profile (display of workers)
- Epic 2 booking / worker pick UI / `worker_id` on bookings
- Epic 7 worker↔service assignment, salon switcher
- Epic 3 Worker Availability Panel
- Delete / deactivate / `active` flag
- Per-worker hours, shifts, vacation
- Worker photos, bios, mini-profiles
- Sentinel “no preference” worker row
- Public owner registration
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins
