# STORY-25 — Assistant requests in queue

| Field | Value |
|-------|--------|
| ID | STORY-25 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21, STORY-13 |

## User story

As an owner, I want assistant-originated requests in the same pending queue, tagged and with a collapsed transcript on Request Detail, so that I can accept or counter-propose without a second workflow.

## Acceptance criteria

- A request sent from chat appears in the same pending queue as picker requests.
- The row is tagged as assistant-originated.
- Request Detail shows a collapsed transcript that explains the preferred time (e.g. why Saturday 14:00).
- Accept, counter-propose, and decline are the same actions as for picker requests.

## Out of scope

- A second owner inbox for chat
- Take over while chatting (STORY-27)
- Changing `createBooking` status machine
