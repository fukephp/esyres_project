# Story map: STORY-29

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-29 |
| Source | `docs/stories/STORY-29.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-29.md` |

## Destination

A customer can ask to reschedule a confirmed booking. The original confirmed slot stays occupied until the new time is approved. Default cap is one in-progress reschedule per booking. The owner pending queue tags that reschedule.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 06, 08 #5 #24 #33), `docs/adr/0015-reschedule-same-row-overlay.md`, `docs/stories/STORY-29.md` plus STORY-14 / 13 / 18 / 19 / 01 / 30, `docs/glossary.md` (**Reschedule**, **In-progress reschedule**, **Accept reschedule**, **Dismiss reschedule**, **Reschedule preferred time**, **Reschedule cap**), `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Standing preferences:
  - Do not invent a second API
  - Do not reuse `askOtherTime` (it unoccupies)
  - Do not cancel a confirmed booking this PR
  - Do not counter-propose an in-progress reschedule this PR
  - Do not add `/booking/:id`
  - Do not ship owner web push (STORY-31)
  - Do not add Playwright, Pest, codegen, `vite-plugin-pwa`

## Decisions so far

- STORY-29 only: reschedule of a **confirmed** booking. Not ask other time (STORY-19). Not cancel (STORY-30). Not per-worker vacation.
- Original confirmed slot stays occupied until the new time is approved.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Bosnian-first. Design 2: guest calm on `/bookings`; owner dense on `/owner`.
- **Representation (2026-09-10):** same booking stays `confirmed`. Original range still occupies. New preferred day/time is an overlay on that row. Not a child request. Not a flip to `requested`. ADR 0015.
- **Customer ask (2026-09-10):** confirmed row on `/bookings`. Day+time only. Worker and services stay. Same inline date+time pattern as ask other time. No new route.
- **Cap (2026-09-10):** `salons.reschedule_cap` integer default 1. No settings UI. Second ask **replaces** the overlay. Cap `0` = disabled. Values `>1` stored, unused (overlay max is 1). Not a lifetime count.
- **Gates (2026-09-10):** customer ask uses session + verified email + verified phone (`APP_ENV=local` skipped). List stays session-only.
- **Owner this PR (2026-09-10):** accept reschedule and dismiss reschedule. No counter-propose, drag, or `proposeTime` on an overlay. Queue-row actions only. Request Detail stays requested-only.
- **Mutations (2026-09-10):** new guest ask + owner accept/dismiss. Do not reuse `askOtherTime`, `acceptPreferredTime`, or `declineBooking`. Do not re-stamp `owner_responded_at`.
- **New occupancy (2026-09-10):** overlay range does **not** occupy. Original confirmed range does until accept.
- **Queue day (2026-09-10):** tagged row on the **new** preferred day. Original day keeps the occupied cell on the panel, not the queue row (unless same calendar day).
- **Busy-level (2026-09-10):** original `preferred_date` only. Do not count the overlay day.
- **Realtime (2026-09-10):** `bookingRescheduled(salonId)` subscription. `/owner` refetches queue + occupying. No push. Do not reuse `bookingCustomerResponded`.
- **Edges (2026-09-10):** no customer withdraw. No auto-dismiss/expire when original start arrives. Overlay stays until owner accept/dismiss.
- **Display + copy (2026-09-10):** `/bookings` main clock is original preferred. Show asked new time + in-progress copy. CTA `Promijeni termin` when no overlay; while in-progress hide that CTA but the date+time expand can **replace**. Queue tag `Premještaj`. Accept `Prihvati`. Dismiss `Zadrži stari`. In-progress `Premještaj u toku. Hvala na strpljenju.`

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Ask other time on a time-proposed row (STORY-19)
- Cancel (STORY-30)
- Counter-propose / drag of an in-progress reschedule
- Customer withdraw of an overlay
- Auto-expire / auto-dismiss when original start arrives
- Per-worker vacation as a reschedule reason
- Owner settings UI / mutation to edit the reschedule cap (STORY-01)
- Owner web push / SMS / reminder email (Epic 6)
- New-request live update on owner home
- `/booking/:id`
- Changing picker / assistant `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`
