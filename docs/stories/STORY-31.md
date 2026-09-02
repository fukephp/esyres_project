# STORY-31 — Owner push notifications

| Field | Value |
|-------|--------|
| ID | STORY-31 |
| Epic | 6 — Notifications |
| Loop | — |
| Depends on | STORY-13 |

## User story

As an owner, I want real-time push notifications for new requests and customer responses, so that I don’t have to keep checking the app manually.

## Acceptance criteria

- Owner receives web push for a new requested booking.
- Owner receives web push when a customer confirms, rejects, or asks other time.
- Push uses VAPID (no OneSignal). Payload includes salonId (for switcher context).
- Owner with the app open or closed can still get the event (closed tab).

## Out of scope

- In-app queue update without push (STORY-20)
- Customer SMS fallback (STORY-32)
- Reminder email (STORY-33)
- Marketing / re-engagement messages (Phase 2)
