# Story map: E3-one-tap-accept

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-one-tap-accept |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to accept a guest's preferred time in one tap when it works, so that simple requests don't need an extra back-and-forth.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E3-one-tap-accept.md` |

## Destination

A verified owner can accept a guest’s preferred time in one tap: that booking goes `requested → confirmed` at the preferred instant, occupies the worker’s clock range, and leaves the pending queue.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Worker Availability Panel, Request Detail), `docs/mvp/07-Stories.md` Epic 3, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `docs/adr/`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “closes the happy path”
- Code today (`esyres_app/`): `Booking` status is `requested` only; `createBooking`; `pendingBookings` + lazy `/owner` queue (rows display-only); `OwnerAccess` (verified email + owns salon). Schema `BookingStatus` = `REQUESTED`. No `starts_at` / `proposed_starts_at` / occupancy overlap check / owner mutations. No Reverb, no Playwright, no GraphQL codegen. Notifications not wired.
- Occupancy today (`BusyLevel\Occupancy`): day busy-level sums `requested` + `time_proposed` + `confirmed` durations; it does not check per-worker clock overlap.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship `proposeTime`, `declineBooking`, Worker Availability Panel, or Request Detail this PR unless Destination is redrawn
  - Invite-only: no public “Register salon”
  - Lazy `/owner` chunk (architecture 08 #10)

## Decisions so far

- Mutation name is `acceptPreferredTime` (`docs/architecture/03-Backend.md`). Sets `confirmed` directly; does not go through `time_proposed`.
- Status happy path: `requested → confirmed` (`docs/mvp/01`, `docs/architecture/05-Data-Model.md`).
- `time_proposed` and `confirmed` occupy `[startsAt, startsAt + duration)` on a worker. `requested` does not occupy a clock slot.
- Owner access = verified email + owns the salon (`OwnerAccess`). Phone OTP not required for owner mutations.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Pending queue (sibling, compiled) lists `requested` for one salon-day. After accept, the row must not remain in `pendingBookings`.
- Notifications stay queued and never inline; this PR does not dispatch (Epic 6).
- Trust **display** is Phase 2. This PR captures `owner_responded_at` only.
- **Slice (2026-08-31):** GraphQL `acceptPreferredTime(bookingId)` and a Prihvati control on each pending-queue row. Panel, drag, Request Detail, `proposeTime`, and `declineBooking` stay sibling stories. Same mutation those surfaces will call later.
- **No preference (2026-08-31):** one-tap only when the request already has a worker. `acceptPreferredTime(bookingId)` uses existing `worker_id`. Null → `WORKER_REQUIRED`. UI: Prihvati only on named-worker rows; no-preference rows stay display-only until a sibling assigns a worker.
- **Overlap (2026-08-31):** accept fails when that worker already has `confirmed` or `time_proposed` overlapping `[preferred start, preferred start + duration)`. Half-open: end = next start is OK. Other `requested` rows do not occupy. Different workers do not conflict. Error: `SLOT_TAKEN`.
- **Occupied start (2026-08-31):** no new datetime this PR. Confirmed-via-accept occupies `[preferred_starts_at, preferred_starts_at + duration)`. Overlap helper treats `confirmed` and `time_proposed` as occupying (no `time_proposed` rows yet). `proposed_starts_at` waits for counter-propose.
- **Notifications (2026-08-31):** none this PR. No status job, no push/SMS/email. Epic 6.
- **Hours/break (2026-08-31):** no hours or break check on accept. Owner tap is the assertion. Overlap + worker required only.
- **Response time (2026-08-31):** nullable `owner_responded_at` (UTC) on the booking, set once on successful accept. Not on `SLOT_TAKEN` / `WORKER_REQUIRED`. Not on GraphQL this PR (queue does not show it). No badge math. See ADR 0007.
- **Mutation contract (2026-08-31):** `acceptPreferredTime(bookingId: ID!): Booking!`. GraphQL `BookingStatus` adds `CONFIRMED` only. Return status `CONFIRMED`. Guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`; missing booking or not this salon’s owner → `FORBIDDEN`; status not `requested` → `NOT_REQUESTED` (not idempotent). Plus `WORKER_REQUIRED`, `SLOT_TAKEN`.
- **Queue UI (2026-08-31):** Prihvati on named-worker rows only (not a row link). `useMutation` then refetch `pendingBookings` for that salon/date. No optimistic cache, no toast kit. Disable the tapped button while in flight. Error copy under that row: `SLOT_TAKEN` → “Taj termin je zauzet.”; `NOT_REQUESTED` → “Zahtjev više nije na čekanju.”; fallback → “Zahtjev nije prihvaćen.” `WORKER_REQUIRED` mapped; button hidden on no-preference. Success: row gone after refetch.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- `proposeTime`, `declineBooking`
- Worker Availability Panel, `@dnd-kit`, 15-minute grid
- Request Detail (tap-row → form: accept / decline / counter-propose) unless Destination is redrawn
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7)
- Customer My Bookings / Time Proposed screen (Epic 4)
- Status notifications (push / SMS / email) — Epic 6
- Request auto-expire job / TTL
- Reverb / nginx / redis / mailpit in slim Compose
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Public owner registration; worker logins; payments; Pest
- Trust badge **display** (Phase 2)
