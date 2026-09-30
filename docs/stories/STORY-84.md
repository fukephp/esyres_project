# STORY-84 — Guest quarter starts

| Field | Value |
|-------|--------|
| ID | STORY-84 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | — |
| Depends on | STORY-08, STORY-09, STORY-65 |

## User story

As a customer, I want to pick a quarter start on Pošalji zahtjev and see which ones are Zauzet, so that I ask for a time the salon can still take.

## Acceptance criteria

- The picker modal has no time input. After at least one service is chosen, it lists quarter starts (`:00`, `:15`, `:30`, `:45`) for the date in the modal. The hours row still seeds that date. The date field stays; changing it reloads the list and does not bring back a typed time. Danas, Sutra, and Drugi dan stay on owner Telefon only.
- A listed start is one whose range fits that day’s open hours and does not run through the break or past close. The range is the start plus the selected service durations, summed and rounded up to 15 minutes.
- **Zauzet** is visible and not tappable. It means the range overlaps a `confirmed` or `time_proposed` booking. A named worker uses that worker’s book. No preference is Zauzet only when every worker is blocked for the whole range. A `requested` row does not make a start Zauzet. Two guests can send the same free quarter. Sending still creates `requested` and does not occupy.
- Quarters before now today are listed and disabled. A salon with no workers follows hours, break, close, and past only; an empty staff list does not mark every start Zauzet.
- A closed day shows `Salon je zatvoren taj dan.` An open day with nothing tappable shows `Nema slobodnog termina.` Send stays off in both cases.
- The list is a public query of `{ time, booked }` for that salon, date, services, and worker choice. It does not include customer names or occupying rows.
- Picker `createBooking` (no chat intake) rejects a start the list would disable: past, off-quarter, outside hours, through the break, past close, or that occupying overlap. A clash with only another pending request still succeeds.
- Changing services or worker clears a start that is no longer tappable.

## Out of scope

- Chat stays 1–3 coarse suggestions, plus the typed other time, with today’s checks
- My Bookings ask-another-time and reschedule stay typed
- Owner counter-propose and Telefon Drugi dan stay typed
- An owner screen to edit the quarter catalog
- Holding a chair when the guest sends
- Carbon display labels (STORY-83)
