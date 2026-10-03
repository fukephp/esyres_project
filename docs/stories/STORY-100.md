# STORY-100 — My profile

| Field | Value |
|-------|--------|
| ID | STORY-100 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | — |
| Depends on | STORY-99 |

## User story

As a customer, I want a profile with my latest booking and a way through to the full list, so that Moji zahtjevi is not the only page I have.

## Acceptance criteria

- `/my-profile` uses the customer card pack. A guest sees the Rezervacije AuthShell and no booking. A logged-in customer sees their person name when they have one.
- The booking block is the newest booking of any status, with the same row content as Moji zahtjevi. **Vidi sve** goes to `/bookings`. No bookings: an empty line and that link.
- **Postavke** is a link to `/my-profile/settings`.
- Logged-in nav gains **Profil** immediately before Moje rezervacije on `/`, `/salons`, `/salon/:id`, `/bookings`, `/my-profile`, and `/my-profile/settings`. Greeting stays plain text. Homepage order: greeting, Profil, Moje rezervacije, Odjava, Panel. Discovery and salon: greeting, Profil, Moje rezervacije. `/bookings`, `/my-profile`, and `/my-profile/settings` keep Odjava. `/create-salon` and the owner shell stay as they are.
- Moji zahtjevi behavior is unchanged. No rate control on a booking row.

## Out of scope

- The settings form (STORY-101)
- Omiljeni saloni (STORY-102)
- Predloženi saloni (STORY-103)
- Moje ocjene (STORY-104)
