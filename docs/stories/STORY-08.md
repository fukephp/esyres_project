# STORY-08 — Multi-service request

| Field | Value |
|-------|--------|
| ID | STORY-08 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | `E2-multi-service` |
| Depends on | STORY-07 |

## User story

As a customer, I want to select multiple services in one request, so that I don’t need to submit separate requests for a haircut and a color. Native preferred day and time plus same-page “zahtjev poslan” are in this PR (locked map merge).

## Acceptance criteria

- A verified customer (email + phone) can create one booking with two services on one salon: status requested, two snapshots (name, duration, price feninga), duration minutes = sum rounded up to 15.
- No session → unauthenticated. Email unverified → email unverified. Email verified and phone not → phone unverified.
- Empty, duplicate, or foreign services rejected. Omitted worker stores no preference. Worker not on that salon rejected.
- Closed weekday rejected. Past datetime (Sarajevo) rejected. Malformed date/time rejected. A time on an open day inside a break or outside hours is accepted (preference, not a held slot).
- After a requested row, that salon-day busy-level uses occupancy (requested + time_proposed + confirmed minutes / open minutes), not a always-low stub.
- Profile picker: `Pošalji zahtjev`, multi-select, native date+time, stacked duration + KM total, same-page success copy.

## Out of scope

- Public register, email-verify UI, phone OTP UI (STORY-10–12)
- Worker pick UI (STORY-09)
- Designed picker polish / dedicated confirmation route — not separate stories; native picker + same-page success are this story
- Salon Booking Assistant (Epic 10)
- Owner panel / accept / propose / decline (Epic 3)
- My Bookings (STORY-18)
