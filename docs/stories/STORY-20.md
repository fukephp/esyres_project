# STORY-20 — Owner sees customer respond

| Field | Value |
|-------|--------|
| ID | STORY-20 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | — |
| Depends on | STORY-19 |

## User story

As an owner, I want to be notified immediately when a customer responds to a proposed time, so that I can react (e.g. re-propose) quickly.

## Acceptance criteria

- When a customer confirms, rejects, or asks other time, owner home reflects that change without the owner manually polling the pending queue.
- Confirm: the booking is no longer pending and occupies the agreed worker-range. Reject: gone from pending and not occupying. Ask other time: same id back in pending on the new preferred date.
- Guest customers do not receive this owner signal.
- Web push and SMS are not this story (STORY-31, STORY-32).

## Out of scope

- VAPID web push payloads (STORY-31)
- SMS fallback (STORY-32)
- Auto-expire of unanswered proposals
- Take over / chat (Epic 10)
