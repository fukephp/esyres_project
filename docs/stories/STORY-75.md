# STORY-75 — Zapisi

| Field | Value |
|-------|--------|
| ID | STORY-75 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-74, STORY-25 |

## User story

As an owner, I want a list of this salon’s bookings by origin and day, so that I can open any of them and see whether it came from the guest, the assistant, or a phone booking.

## Acceptance criteria

- OwnerNav **Zapisi** is on owner routes. It is this salon, with the same switcher as Zahtjevi (`?salon=` when the owner has more than one salon). Not a chain list. Not owner settings.
- The list is one day and every status: `requested`, `confirmed`, `time_proposed`, `declined`, `cancelled`. In-flight chats that never became a booking are absent.
- Filters are origin and day. Origin labels are **Gost** (picker), **Asistent**, and **Telefon**. Rows show time, origin, name (the customer’s person name, or the caller name), services, and status, sorted by time. An empty day is an empty list.
- Every row opens the existing Request Detail. A Telefon row that is `cancelled` is the owner’s phone booking cancel. A Gost row that is `cancelled` is still the customer’s cancel.

## Out of scope

- The Telefon wizard (STORY-74)
- Voice recording, a bubble transcript, and training an agent
- Filters other than origin and day
- In-flight chat rows
