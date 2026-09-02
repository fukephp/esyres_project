# STORY-30 — Cancel with late warning

| Field | Value |
|-------|--------|
| ID | STORY-30 |
| Epic | 5 — Reschedule & Cancellation |
| Loop | — |
| Depends on | STORY-18, STORY-01 |

## User story

As a customer, I want to cancel a booking and see a warning (not a block) if I’m cancelling late, so that I understand the impact without being locked out.

## Acceptance criteria

- A customer can cancel from My Bookings.
- If now is inside the salon’s `cancellation_notice_hours`, the UI warns; cancel still succeeds (not a hard block).
- Late cancel is visible later in owner stats (capture; badge display is Phase 2).
- Owner-configurable notice window stays the STORY-01 field (no second setting).

## Out of scope

- Hard-block late cancel
- Owner decline of a requested row (STORY-17)
- Trust badge display (Phase 2)
