# STORY-22 — Assistant time suggestions

| Field | Value |
|-------|--------|
| ID | STORY-22 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21 |

## User story

As a customer, I want the chat to suggest 1–3 preferred times from hours and how busy the day looks, so that I can choose a time without seeing the owner’s real calendar.

## Acceptance criteria

- After service, worker preference, and day, chat offers one to three preferred times.
- Suggestions use salon hours, that day’s busy-level, and worker preference only.
- Chat never names live free slots or holds a cell.
- Guest picks one suggested time (or equivalent preference) before send.

## Out of scope

- Owner Worker Availability Panel as a guest view
- Auto-confirm
- Changing busy-level thresholds (still placeholders in mvp 08)
