# STORY-26 — Owner chat tab

| Field | Value |
|-------|--------|
| ID | STORY-26 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21 |

## User story

As an owner, I want a chat tab with a badge for conversations that have not become a request yet, so that in-flight chats are visible without replacing the panel as home.

## Acceptance criteria

- Owner home stays pending queue + Worker Availability Panel.
- A chat tab lists conversations that have not yet become a request.
- The tab shows a badge for those in-flight conversations.
- After send, the object is the booking (not an open chat as home).

## Out of scope

- Take over (STORY-27)
- Auto-page on every chat
- Worker-facing chat (workers are not users)
