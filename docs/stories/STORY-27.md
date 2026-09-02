# STORY-27 — Take over

| Field | Value |
|-------|--------|
| ID | STORY-27 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-26 |

## User story

As an owner, I want optional Take over so I can handle one conversation myself, and I want the assistant to keep going (and still be able to send a request) unless I have tapped Take over. After hours or DND, take-over is off.

## Acceptance criteria

- Take over is optional and owner-only.
- Guest waits only after the owner taps Take over.
- Until that tap, the assistant continues and can still send a requested booking.
- After hours or DND: take-over is off; the assistant always finishes to a request.

## Out of scope

- Auto-page on every chat
- Worker take-over
- After-hours meaning a live owner shift calendar (Phase 2)
