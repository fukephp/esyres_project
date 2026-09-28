# STORY-74 — Phone booking

| Field | Value |
|-------|--------|
| ID | STORY-74 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-01, STORY-02, STORY-03, STORY-67, STORY-70, STORY-72 |

## User story

As an owner, I want to write a phone booking from Zahtjevi in a few steps, so that a call becomes a confirmed booking for a caller who has no Esyres account, without a worker login.

## Acceptance criteria

- Zahtjevi shows **Telefon** for the salon already in context (same `?salon=` as Zahtjevi). It opens an owner page. Not a modal. Not an empty cell on the day list. Not a worker login.
- Steps, in order. One or more services, under that salon’s category headings; none is rejected. A day and a time, not taken from the day already selected on Zahtjevi; a time earlier today is allowed. A worker, required, and only workers free for that range. Caller name, required; blank or whitespace is rejected. Phone, optional loose text, trimmed; empty is allowed; it is not a user phone, not unique, and not OTP. Note, optional plain text; empty is allowed.
- The range is the start plus the service durations, summed and rounded up to 15 minutes, same as any booking. A closed day does not save. A range outside that day’s working hours does not save. A range that sits in the break, or spans it, does not save. Overlap with a confirmed or time-proposed range on that worker does not save. The range is half-open: a booking that ends when the next starts is free. No free worker means no save. No double-book. Workers still inherit salon hours.
- Save creates a confirmed phone booking with no customer user. A matching customer phone does not attach the booking. It is not `requested` and it is not counter-proposed. It occupies that worker. Busy-level and basic stats include it the same way as any confirmed booking. After save, Zahtjevi opens on that day with a normal occupying row (service snapshot names and worker).
- Request Detail shows the caller name, phone, note, and the saved choices (services, day, time, worker, name, phone, note). No other-bookings memory. No customer cancel, no reschedule, and no My Bookings row. No push, SMS, or email on save.
- Owner cancel is only on a phone booking, from that detail. Two steps, no reason. Only before the start. Status becomes `cancelled`. The range frees. No trust counters. No late-cancel warning. After the start, cancel is refused.
- No-show stays the existing Request Detail action after the start. Status stays `confirmed`. The salon no-show counter increments. The customer counter does not. A second mark does not increment again.
- The worker on the booking is the stylist. The signed-in owner is who wrote it. The product cannot tell which person shared that login.

## Out of scope

- Zapisi (STORY-75)
- Voice recording, a bubble transcript, and an agent that books from audio
- Worker login and receptionist roles
- Owner reschedule (cancel and write a new phone booking)
- Empty-cell create on the day list
- Linking the caller to a customer user
- Push, SMS, or email for this booking
