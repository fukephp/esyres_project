# STORY-29 — Reschedule confirmed

| Field | Value |
|-------|--------|
| ID | STORY-29 |
| Epic | 5 — Reschedule & Cancellation |
| Loop | — |
| Depends on | STORY-14 |

## User story

As a customer, I want to reschedule a confirmed booking without losing my original appointment until the new time is approved, so that I’m never left with nothing.

## Acceptance criteria

- A customer can ask to reschedule a confirmed booking.
- The original confirmed slot stays occupied and protected until the new time is approved.
- Default cap is one in-progress reschedule per booking (owner-configurable cap may already exist on the salon).
- Reschedule is visually tagged on the owner pending queue.

## Out of scope

- Ask other time on a time-proposed row (STORY-19)
- Cancel (STORY-30)
- Per-worker vacation as a reschedule reason
