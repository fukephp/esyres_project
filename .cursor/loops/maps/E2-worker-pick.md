# Story map: E2-worker-pick

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-worker-pick |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to optionally pick a specific worker or say "no preference," so that I have control when I care, and less friction when I don't.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E2-worker-pick.md` |

## Destination

On `/salon/:id`, a customer can pick a named worker or **no preference** and send `createBooking` with optional `workerId`. Guests can read that salon’s workers. Not the owner panel, not chat, not a new mutation.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 2, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: `createBooking` already takes optional `workerId` (omit/null = no preference; foreign salon → `INVALID_WORKER`). Behat covers omit + foreign only — no happy path with a valid worker. `salon.workers` is owner-gated via `SalonOwnerField` (same gate as `cancellationNoticeHours`). `Worker` type is already `id` + `name`. No `active` column, no worker↔service assignment table. Picker on `/salon/:id` does not query or send workers. `CreateBookingInput` on the SPA omits `workerId`.
- Glossary already has **Worker** and **No preference**.
- UI goals still list “visual treatment for no preference vs worker-specific, on both sides” as not decided — owner-side treatment is Epic 3; this map only needs the guest picker.
- Standing preferences:
  - Do not invent a second API (not REST, not a second workers field unless we lock that)
  - Do not ship Epic 10 chat worker steps, owner panel, or My Bookings worker display
  - Do not add worker logins, photos, or active/inactive this PR

## Decisions so far

- Mutation shape stays: optional `workerId` on existing `createBooking`. No new mutation. No change to send gates (session + email + phone).
- Omit/null `workerId` remains **no preference** (`worker_id` null). Foreign or missing id remains `INVALID_WORKER`. A valid worker on that salon must persist `worker_id` (Behat today never asserts this happy path).
- `cancellationNoticeHours` stays owner-gated. Worker create/update stays owner-only.
- Do not add worker↔service assignment or `active` this PR (data-model sketch only; schema has neither). Do not filter the guest list by selected services.
- `Booking` GraphQL type stays without a worker field this PR; Behat keeps checking `bookings.worker_id` in the DB (existing “booking has no worker” pattern).
- Chat worker pick is Epic 10. Owner visual treatment for no-preference vs named requests is Epic 3 / still-open UI. Designed picker polish stays sibling E2-day-time-picker.
- Stack stays Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- **Ungate (2026-08-31):** existing `salon.workers` is public (`id` + `name`). No second field. `cancellationNoticeHours` stays owner-gated. Behat: guest can query workers; guest still cannot query notice hours.
- **Placement (2026-08-31):** worker control only in picking mode on `/salon/:id` (after `Pošalji zahtjev`), with date+time. Not on the always-visible catalog.
- **Default / empty (2026-08-31):** default is **no preference**; SPA omits `workerId`. Zero workers: hide the control; send still omits `workerId`.
- **Widget (2026-08-31):** radio group in picking mode. First option **Nema preference**, then names. No chips, no `<select>`, no avatars. Owner-side visual treatment stays Epic 3.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty — fog graduated into opens -->

## Out of scope

- Salon Booking Assistant chat worker step (Epic 10)
- Owner panel / queue visual treatment for no-preference vs named (Epic 3)
- Worker↔service assignment, active/inactive, photos, per-worker hours
- Worker logins
- Changing `createBooking` gates or OTP/email-verify
- Designed week-busy strip / picker polish (sibling E2-day-time-picker)
- Dedicated confirmation screen (sibling E2-request-sent)
- My Bookings list (Epic 4)
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- nginx, redis, reverb, mailpit
- Native apps, payments, public owner registration
