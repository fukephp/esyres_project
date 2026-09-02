# STORY-33 — Reminder email

| Field | Value |
|-------|--------|
| ID | STORY-33 |
| Epic | 6 — Notifications |
| Loop | — |
| Depends on | STORY-11, STORY-14 |

## User story

As a customer, I want a reminder email before my appointment, so that I don’t forget it.

## Acceptance criteria

- A confirmed booking sends a reminder email the day before and an hour before (Sarajevo clock).
- Reminder requires a verified email (already gated to confirm).
- Email is the reminder channel; push/SMS stay for status changes.

## Out of scope

- SMS reminders
- Marketing email
- Unverified-email reminders
