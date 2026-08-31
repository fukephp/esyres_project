# Story map: E3-decline

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-decline |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to decline a request with an optional reason, so that the customer understands why without me needing to propose a time first.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E3-decline.md` |

## Destination

A verified owner can decline a pending request with an optional reason: that booking goes `requested → declined`, leaves the pending queue, and does not occupy a clock slot. Reason is persisted for Epic 4 My Bookings; this PR does not list bookings on `/bookings`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Decline, Request Detail, My Bookings), `docs/mvp/07-Stories.md` Epic 3 + Epic 4, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “next Epic 3 action; declined for My Bookings”
- Code today (`esyres_app/`): `/owner` queue + panel; `acceptPreferredTime` (named worker); `proposeTime` + drag; GraphQL `BookingStatus` = `REQUESTED` \| `CONFIRMED` \| `TIME_PROPOSED`; no `declineBooking`; no decline/expire reason column; `pendingBookings` is `requested` only; `occupyingBookings` is `confirmed` \| `time_proposed`; `BusyLevel\Occupancy` already omits declined. `/bookings` is auth + verify chrome with empty copy — no booking list. No Reverb, no Playwright, no GraphQL codegen.
- Sibling: tap fallback / Request Detail is a separate Epic 3 story (accept / decline / form propose). Customer Time Proposed + My Bookings status list is Epic 4.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Invite-only: no public “Register salon”
  - Lazy `/owner` chunk (architecture 08 #10)
  - One story → one PR: do not swallow the Epic 4 My Bookings list unless Destination is redrawn

## Decisions so far

- Mutation name is `declineBooking` (`docs/architecture/03-Backend.md`).
- Owner may decline a **request** without counter-proposing first (story + Key Features Decline). Path: `requested → declined`. Overview diagrams that only show declined after `time_proposed` were incomplete. See ADR 0010.
- Optional reason is free text shown to the customer (Key Features). Expire later writes sentinel `expired` on the same field (architecture 05 / 08 #27); expire job is not this PR.
- Declined does not occupy a clock slot. Day busy-level already excludes declined (`Occupancy` sums requested + time_proposed + confirmed only).
- After a successful decline, that id must not remain in `pendingBookings`.
- Owner access = verified email + owns the salon (`OwnerAccess`). Phone OTP not required for owner mutations.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Notifications stay queued and never inline; this PR does not dispatch (Epic 6). Trust **display** is Phase 2.
- Prihvati / drag / `proposeTime` stay. This story does not remove them.
- Customer reject of a `time_proposed` booking is Epic 4, not this story.
- **Slice (2026-08-31):** owner `declineBooking` only. Persist `DECLINED` + optional reason so Epic 4 can list it. `/bookings` stays empty chrome this PR.
- **Queue UI (2026-08-31):** Odbi on every pending-queue row (named worker and no preference). Not a row link. Request Detail stays the sibling. Same mutation that screen will call later. Decline does not require a worker.
- **Response time (2026-08-31):** successful decline stamps `owner_responded_at` once if still null (same as accept/propose). Failed decline does not. Still not on GraphQL `Booking`. ADR 0007 amended.
- **Reason (2026-08-31):** nullable `bookings.decline_reason` (varchar 255). GraphQL `declineReason: String` on `Booking` (null if unset). `declineBooking(bookingId, reason: String)` — omit/blank/whitespace → null. Over 255 → `REASON_TOO_LONG`. Expire later writes `expired` into this column (not this PR). Owner UI does not display the saved reason after success.
- **Confirm UX (2026-08-31):** two-step on the row. Odbi expands optional reason + Potvrdi / Odustani. Potvrdi → `declineBooking`. Odustani collapses, no mutation. No modal, no toast. Disable while in flight. One expanded row at a time.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty — remaining items are sharp enough to grill -->

## Out of scope

- Request Detail tap/form fallback (sibling Epic 3) unless Destination is redrawn
- Customer Time Proposed screen (Approve / Reject / ask other day) — Epic 4
- Customer confirm/decline of a counter-proposal — Epic 4
- Status notifications (push / SMS / email) — Epic 6
- Request auto-expire job / TTL (same `declined` + `expired` later)
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7)
- Cancel / reschedule (Epic 5)
- Reverb / nginx / redis / mailpit in slim Compose
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Public owner registration; worker logins; payments; Pest
- Trust badge **display** (Phase 2)
