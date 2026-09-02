# STORY-23 — Assistant salon voice and live data

| Field | Value |
|-------|--------|
| ID | STORY-23 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21 |

## User story

As a customer, I want the chat to speak as this salon in Bosnian and only use that salon’s live services, prices, hours, address, workers, and busy-level, so that it does not invent policies or feel like a third brand.

## Acceptance criteria

- Chat copy is Bosnian and salon-branded (no named platform bot).
- Answers about services, KM prices, durations, hours, address, workers, and busy-level come from that salon’s live data.
- Chat does not invent cancellation policy, prices, or hours that are not on the salon.

## Out of scope

- Unknown → say so / ping owner (STORY-28)
- LLM paraphrasing outside live data (Phase 2)
- English language switcher
