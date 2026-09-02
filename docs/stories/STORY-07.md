# STORY-07 — Salon profile

| Field | Value |
|-------|--------|
| ID | STORY-07 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `E1-salon-profile` |
| Depends on | STORY-05, STORY-01, STORY-02 |

## User story

As a customer, I want to see a salon’s services, prices, hours, and a busy-level badge on its profile, so that I can decide whether to request an appointment.

## Acceptance criteria

- A guest (no session) can open `/salon/:id` and read name, weekly hours (including closed days and breaks), and services (name, category, duration, price in feninga).
- Missing salon id returns null, not an auth error.
- Guest cannot read owner-only fields such as cancellation notice hours; a verified owner of that salon can.
- Busy-level for a date with no bookings is the low/green enum; customer UI renders the enum only (no percent, no slot grid).
- KM display formats integer feninga as BAM in `bs-BA`.

## Out of scope

- Nearby / Popular / search (STORY-05, STORY-06)
- Request picker / `Pošalji zahtjev` (STORY-08)
- Salon Booking Assistant (Epic 10)
- Photos, address, geocode, maps link-out
- Workers on the guest profile (STORY-09)
- QR hold cookie (STORY-34)
