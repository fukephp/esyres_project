# STORY-28 — Assistant unknown and ping

| Field | Value |
|-------|--------|
| ID | STORY-28 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21 |

## User story

As an owner, I want the assistant to say it does not know when the answer is not in live salon data, and optionally ping me, without making the guest wait on me.

## Acceptance criteria

- If the guest asks something not in live salon data, chat says it does not know (no invented policy).
- Chat may ping the owner; the guest does not wait on that ping.
- Intake can still finish to a request without the owner answering the ping.

## Out of scope

- LLM answers outside live data
- Guest wait-for-owner as default
- WhatsApp / Viber delivery of the ping
