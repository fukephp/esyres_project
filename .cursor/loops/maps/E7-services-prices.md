# Story map: E7-services-prices

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-services-prices |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to add/edit services with durations and prices, so that customers see accurate options.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E7-services-prices.md` |

## Destination

A verified owner can persist named services on a salon they own (category, duration, price in feninga), so later Epic 1 profile and Epic 2 multi-select read a real catalog — not placeholders.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/07-Stories.md` Epic 7, `docs/architecture/` (03, 04, 05, 08), `docs/glossary.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today (`esyres_app/`): Lighthouse `/graphql`, Sanctum cookies, `Salon` + hours mutation, Behat GraphQL-over-HTTP on MySQL. No `Service` model. PWA still throwaway (no Router / Apollo / i18n / `/owner`).
- Design 2 specifies owner panel density, not a service-settings screen.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not expand into workers, panel, public profile, or owner UI
  - Invite-only: no public “Register salon”

## Decisions so far

- Epic 7 this story only: add/edit services with durations and prices (story text). Worker assignment, photos, descriptions, and packages are not assumed.
- Owner access = user who owns the salon. Mutations require verified email plus owning the salon (same policy as hours).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL test DB. Not Pest, not `php artisan test` as the gate.
- Prices are integer feninga (`Int` in GraphQL), formatted as KM later. No float money.
- Per-service duration (architecture decision 32). Default **30** minutes when omitted on create.
- Category is required: hair / make-up / massage. A salon may offer more than one category.
- **Slice (2026-08-29):** this PR is a **backend vertical**. Owner creates and updates services via GraphQL; Behat is the owner. No `/owner` UI, no React Router / Apollo / product chrome. PWA stays the throwaway placeholder.
- **Write shape (2026-08-29):** per-service mutations, not replace-all catalog. `createSalonService(salonId, input)` and `updateSalonService(id, input)`. Input: `name`, `category`, `durationMinutes` (omit on create → 30), `priceFeninga`. Owner queries `salon { services { … } }` to read back.
- **Empty catalog (2026-08-29):** a newly provisioned salon has zero services until the owner adds them.
- **Duration (2026-08-29):** `duration_minutes` on 15-minute steps, min 15, default 30. Booking still rounds the *sum* up to 15 later.
- **Price (2026-08-29):** non-negative integer feninga (`>= 0`).
- **Name (2026-08-29):** required non-empty; unique per salon.
- **Order (2026-08-29):** insertion order (`id` / `created_at`). No reorder API this PR.
- **Delete (2026-08-29):** no delete or deactivate this PR. Story is add/edit only.
- **Read this PR:** owner can query their salon’s services (Behat reads back). Public salon profile is Epic 1 — not this PR.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Owner settings UI (`/owner`), React Router, Apollo, i18next, Design 2 chrome
- Epic 1 customer salon profile (display of services)
- Epic 2 booking / `BookingService` snapshots
- Epic 7 workers, worker↔service assignment, salon switcher
- Epic 3 Worker Availability Panel
- Delete / deactivate / hide service
- Service photos, descriptions, packages
- Public owner registration
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins
