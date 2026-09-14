# STORY-53 — Hours on salon edit

| Field | Value |
|-------|--------|
| ID | STORY-53 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `STORY-53` |
| Depends on | STORY-01, STORY-51 |

## User story

As an owner, I want to edit working hours, breaks, and the cancellation notice window on salon edit, so that the catalog shop matches how the salon actually runs.

## Acceptance criteria

- Salon edit `/owner/salons/:id` includes the full STORY-01 weekly template: each Mon–Sun closed or one opens/closes (Sarajevo local, 15-minute steps, closes exclusive) plus optional one break inside that day’s open interval, and `cancellation_notice_hours`. Same mutation and rejection rules as STORY-01.
- Saving hours updates **open now** on the catalog for that shop. No holiday calendar. Address/name from STORY-51 stay on the same screen and stay required.

## Out of scope

- Days-only editor (no clock times)
- Holidays; reschedule cap UI
- Services / workers UI (STORY-54, STORY-55)
- DND (stays on chats)
