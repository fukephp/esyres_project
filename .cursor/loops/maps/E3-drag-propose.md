# Story map: E3-drag-propose

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-drag-propose |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to drag a pending request onto an open slot on a worker's row to counter-propose a different time, so that I can adjust when the preferred time doesn't fit.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E3-drag-propose.md` |

## Destination

A verified owner can drag a pending request onto an open 15-minute cell on a worker’s row; that booking goes `requested → time_proposed`, holds the dropped range on that worker, and leaves the pending queue.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Worker Availability Panel), `docs/mvp/07-Stories.md` Epic 3, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “Worker Availability Panel + proposeTime; unblocks E4 response, tap fallback, then E10”
- Code today (`esyres_app/`): `pendingBookings` + lazy `/owner` queue; `acceptPreferredTime` (named worker only; Prihvati on row); `WorkerOverlap` on `[preferred_starts_at, + duration)` for `confirmed` | `time_proposed`; PHP `TIME_PROPOSED` constant unused; GraphQL `BookingStatus` = `REQUESTED` \| `CONFIRMED`; no `proposed_starts_at` / `proposed_worker_id`; no `proposeTime`; no `@dnd-kit`; no Playwright; no GraphQL codegen; no Reverb. `salon { workers hours }` exists (public). Cell tokens `cell-free` / `cell-proposed` / `cell-booked` / `cell-off` are in Design 2, not yet in PWA CSS (only `cell-pending`).
- Occupancy day-percent (`BusyLevel\Occupancy`) still sums `requested` + `time_proposed` + `confirmed`; it is not the panel clock.
- Sibling: tap fallback / Request Detail is the next Epic 3 story. Decline is a later Epic 3 story. Customer Time Proposed is Epic 4.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship Request Detail, `declineBooking`, or customer Time Proposed this PR unless Destination is redrawn
  - Invite-only: no public “Register salon”
  - Lazy `/owner` chunk (architecture 08 #10); `@dnd-kit` stays in that chunk (08 #29)

## Decisions so far

- Mutation name is `proposeTime` (`docs/architecture/03-Backend.md`). Sets `time_proposed`, not `confirmed`.
- Status path: `requested → time_proposed` (`docs/mvp/01`, `docs/architecture/05-Data-Model.md`). Customer confirm/decline is Epic 4.
- A counter-proposal **holds** `[startsAt, startsAt + duration)` on that worker until confirm, decline, or expire. `requested` does not occupy a clock slot (`docs/architecture/03` overlap, 08 #33).
- Data model already names `proposed_starts_at` and `proposed_worker_id` (UTC / worker for the hold). Guest `preferred_*` and original `worker_id` stay. Accept still occupies via `preferred_starts_at`.
- Owner access = verified email + owns the salon (`OwnerAccess`). Phone OTP not required for owner mutations.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens. `@dnd-kit` is the locked drag library (08 #29); tap/form later calls the same mutation.
- Grid cells are 15 minutes. Block length = booking `duration_minutes` (already rounded up to 15 at request). No buffer (`docs/architecture/05`).
- Pending queue (sibling) lists `requested` for one salon-day. After a successful propose, that id must not remain in `pendingBookings`.
- `owner_responded_at` is set once on the first successful accept **or** propose (ADR 0007). Failed overlap does not write it. Not on GraphQL this PR.
- Notifications stay queued and never inline; this PR does not dispatch (Epic 6). Trust **display** is Phase 2.
- Prihvati / `acceptPreferredTime` stays on named-worker queue rows. This story does not remove one-tap accept.
- **Slice (2026-08-31):** Worker Availability Panel (workers × 15-min cells for the selected day) + `proposeTime` + drag from the pending queue onto an open cell. Request Detail tap/form, `declineBooking`, and customer Time Proposed stay later. `@dnd-kit` in the lazy `/owner` chunk.
- **Same day (2026-08-31):** queue date = panel date. Drag proposes a start on the currently viewed Sarajevo day. Cross-day propose is Request Detail (sibling). Changing `?date=` swaps both queue and panel; it does not keep another day’s requests on the board.
- **Drag = propose (2026-08-31):** every successful drop calls `proposeTime`. Never `acceptPreferredTime` from drag, even when start + worker match the preferred named-worker request. Prihvati remains the only accept. See ADR 0008.
- **No preference (2026-08-31):** those rows are draggable. Drop worker = `proposed_worker_id`; guest `worker_id` stays null. Named-worker drop onto another worker: `proposed_worker_id` = drop target, original `worker_id` kept. `proposeTime` always takes a salon worker id.
- **Not an open slot (2026-08-31):** occupied or off *start* cells are not droppable. Duration overflow is not a client no-drop (no ghost); mutation returns `SLOT_TAKEN` / `OUTSIDE_HOURS`. Overlap helper uses `[proposed_starts_at, + duration)` on `proposed_worker_id`.
- **Hours (2026-08-31):** grid window = that weekday’s `opensAt`–`closesAt`. Break and outside that interval = `cell-off`, not droppable. Closed day: no droppable cells. `proposeTime` rejects if `[proposed start, + duration)` is not fully inside open-minus-break → `OUTSIDE_HOURS`. `acceptPreferredTime` unchanged (no hours check). No holiday calendar this PR (not in app). See ADR 0009.
- **Board queries (2026-08-31):** `/owner` keeps `pendingBookings` + public `salon(id) { workers hours }`. New owner-only `occupyingBookings(salonId: ID!, date: String!): [Booking!]!` — same `OwnerAccess` as the queue; not nested on public `salon`. Rows: `confirmed` | `time_proposed` whose occupy-start Sarajevo date is `date`. No client pagination; server cap 100. After propose, refetch queue + occupying.
- **GraphQL Booking (2026-08-31):** add `TIME_PROPOSED`; `proposedStartsAt` (ISO UTC, null unless time-proposed); `proposedWorker { id name }` (null unless time-proposed). Confirmed occupy via `preferredStartsAt` + `worker`. Time-proposed occupy via `proposedStartsAt` + `proposedWorker`. `ownerRespondedAt` still not on GraphQL.
- **proposeTime contract (2026-08-31):** `proposeTime(bookingId: ID!, workerId: ID!, proposedTime: String!): Booking!`. `proposedTime` is local `HH:mm` on `booking.preferred_date` (same-day). Must be 15-min (`:00/:15/:30/:45`) else `INVALID_TIME_STEP`. Bad `HH:mm` → `INVALID_TIME`. Past (Sarajevo now) → `PAST_TIME`. Worker missing or not this salon → `INVALID_WORKER`. Status not `requested` → `NOT_REQUESTED`. Guest / unverified / wrong owner: same as accept. `SLOT_TAKEN`, `OUTSIDE_HOURS`. Success: `status=time_proposed`, set `proposed_starts_at` + `proposed_worker_id`, `owner_responded_at` once if null. Preferred fields unchanged. Transaction + `lockForUpdate`.
- **Overlap helper (2026-08-31):** occupying range for `confirmed` = `[preferred_starts_at, + duration)` on `worker_id`; for `time_proposed` = `[proposed_starts_at, + duration)` on `proposed_worker_id`. Half-open, same as accept.
- **Panel chrome (2026-08-31):** workers as rows, 15-min cells in the open window. Tokens: `cell-free` / `cell-off` / `cell-booked` (confirmed) / `cell-proposed` (time-proposed). No name-in-cell this PR. Zero workers: “Nema radnika.” Closed day: “Zatvoreno ovaj dan.” Queue stays above the grid (Design 2). Prihvati unchanged. Drop errors use existing accept copy plus `OUTSIDE_HOURS` → “Van radnog vremena.”; `PAST_TIME` → “To vrijeme je već prošlo.”; `INVALID_WORKER` mapped; fallback “Zahtjev nije predložen.”
- **UI verify (2026-08-31):** Behat for GraphQL; Vitest for cell-window / droppable-start / 15-min helpers; drag in the browser is `human-only` (no Playwright this PR). Keyboard/tap-form fallback is the sibling Request Detail story.
- **Drag preview (2026-08-31):** highlight the start cell only. No duration ghost. Duration overflow into occupied/off is allowed to drop and fails on `proposeTime` (`SLOT_TAKEN` / `OUTSIDE_HOURS`). Occupied or off *start* cells are not droppable.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Request Detail tap/form fallback (sibling Epic 3 story); no keyboard-dnd this PR
- `declineBooking`
- Customer Time Proposed screen, My Bookings status tabs, customer confirm/decline (Epic 4)
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7)
- Status notifications (push / SMS / email) — Epic 6
- Hours/break **editor** (already Epic 7); only whether propose/grid respect existing hours
- Request auto-expire job / TTL
- Reverb / nginx / redis / mailpit in slim Compose
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Public owner registration; worker logins; payments; Pest
- Trust badge **display** (Phase 2)
