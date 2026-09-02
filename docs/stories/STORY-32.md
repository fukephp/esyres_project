# STORY-32 — Customer SMS fallback

| Field | Value |
|-------|--------|
| ID | STORY-32 |
| Epic | 6 — Notifications |
| Loop | — |
| Depends on | STORY-12, STORY-19 |

## User story

As a customer, I want to be notified by SMS if a push notification doesn’t reach me (e.g. on iOS), so that I don’t miss a time-critical update.

## Acceptance criteria

- Time-critical customer status changes (time proposed / confirmed / declined) try web push first.
- If push does not reach the device, SMS goes to the verified phone.
- Unverified phone does not get SMS (send/respond already required OTP).
- SMS vendor stays an interface; no marketing SMS.

## Out of scope

- Owner SMS
- Reminder email (STORY-33)
- OTP send (STORY-12)
- Viber / WhatsApp (Phase 2)
