# STORY-21 — Assistant chat on profile

| Field | Value |
|-------|--------|
| ID | STORY-21 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-08, STORY-19 |

## User story

As a customer, I want an alternate chat on the salon profile when I am not sure which service or time to pick, so that I can still send the same kind of request without hunting a slot grid.

## Acceptance criteria

- Salon profile keeps `Pošalji zahtjev` as the primary CTA; chat is a visible alternate (`Nisi sigurna? Pitaj salon.`).
- Chat is a scripted intake on that salon’s profile (not a customer inbox, not WhatsApp).
- Completing chat creates the same requested booking as the picker (`createBooking`).
- Chat does not show a live slot grid or hold a clock cell.

## Out of scope

- Time suggestions, voice/data, send-gate UX, owner tab, take-over, unknown/ping (STORY-22–28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
