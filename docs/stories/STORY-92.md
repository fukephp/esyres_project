# STORY-92 — Day-only request

| Field | Value |
|-------|--------|
| ID | STORY-92 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | STORY-92 |
| Depends on | STORY-89, STORY-84, STORY-13 |

## User story

As a customer, I want to send Pošalji zahtjev for an open day without picking a quarter, so that the salon can offer a time.

## Acceptance criteria

- In the request modal, once at least one service is chosen and the day is a known open day, **Send** works with no quarter selected. A tapped quarter still sends that time. A closed day still shows `Salon je zatvoren taj dan.` and Send stays off. An open day with nothing tappable still shows `Nema slobodnog termina.` and Send stays on. When quarters are visible and none is selected, a muted line reads `Možeš poslati i bez vremena.` Selecting a quarter hides that line.
- `createBooking` accepts a missing start. The row is `requested` with `preferred_date` set and no preferred start. It does not occupy a clock. It still counts toward that day’s busy level. Duration is still the service sum. Email and phone gates are unchanged. The same-day service block is unchanged. The assistant still requires a time. A phone booking still requires a time and a worker.
- On the owner side, timed pending rows stay first (soonest preferred time, then created). Day-only rows follow, oldest sent first. The pending card and My Bookings show the date and `Bez vremena`, not a clock. **Na čekanju** still counts the row and can stop on that day. There are no assign-worker taps until a time exists.
- **Predloži** on a day-only row is the existing same-day form: worker (preselected when the guest named one), then that day’s start times. It sets `time_proposed`. The guest approves or rejects as today. Predloži cannot move the booking to another day. **Odbi** is how the owner refuses the day. My Bookings shows no Approve / Reject until a time has been proposed.

STORY-92 supersedes the STORY-89 line that Send stays off when an open day has nothing tappable. That file stays as history.

## Out of scope

- Offering several times at once
- A counter-proposal on a different day
- Assistant sends with no time
- Push, SMS, or email
