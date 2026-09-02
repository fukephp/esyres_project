# STORY-19 — Time proposed respond

| Field | Value |
|-------|--------|
| ID | STORY-19 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | `E4-time-proposed` |
| Depends on | STORY-18, STORY-15 |

## User story

As a customer, I want to approve, reject, or ask for a different day or time once a counter-proposed time is offered, so that I stay in control of the final appointment. Asking for a different day or time updates the same request (new preferred date/time, back to pending), not a duplicate.

## Acceptance criteria

- Confirm on time-proposed → confirmed at the proposed worker and clock; same id; proposed fields cleared; occupies that range; not in pending.
- Reject → declined; no reason; proposed fields cleared; not occupying.
- Ask other time → requested with new preferred date/time; guest worker preference unchanged; same id; not occupying; pending on the new date includes it.
- Guest / unverified email / unverified phone / other customer / not time-proposed rejected. Bad ask date/time leaves status time-proposed.
- `/bookings` time-proposed rows: Prihvati, Odbi two-step, Drugo vrijeme with date+time; other statuses have no respond actions.

## Out of scope

- Owner in-app/realtime “customer responded” (STORY-20)
- Owner push (STORY-31)
- Cancel / reschedule confirmed (Epic 5)
- Customer reject reason field
- `/booking/:id`
