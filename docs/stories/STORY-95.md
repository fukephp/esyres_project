# STORY-95 — Telefon past start

| Field | Value |
|-------|--------|
| ID | STORY-95 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-76 |

## User story

As an owner, I want Telefon to refuse a start that is already past, so that a phone booking cannot be written for a time that has already gone.

## Acceptance criteria

- A past quarter is a start on today whose Sarajevo datetime is already behind now. The current minute stays tappable only while the second is 0. The server uses the same cutoff as `createBooking`: a local start before now is `PAST_TIME`.
- On Danas, past quarters stay listed and disabled. The label is the time only. Zauzet stays the label for a quarter with no free worker. A quarter that is both past and booked shows the time only.
- The Danas chip stays. A later tap on Danas stays on Danas when every quarter is past.
- A past quarter is not a legal start. The first open of the day step still picks the first of the next 7 Sarajevo days that has a legal start. A today with nothing left to tap is skipped, so that open can land on Sutra, or on Drugi dan with an empty date when tomorrow has none either. If none of those 7 days qualify, Danas stays selected, with no pills.
- When Danas or Sutra shows in-hours quarters and none are tappable, the past ones stay visible and disabled, the line is `Nema slobodnog termina.`, and Dalje stays off.
- Drugi dan’s date minimum is today. Choosing today or tomorrow in that date still selects Danas or Sutra and hides both fields. A date before today is blocked in the form and on the server.
- Past is judged when the day step renders, when Dalje is pressed, and when save is pressed. There is no once-a-second refresh.
- When the day step renders with a selected start that is past, or Dalje is pressed on one, that start and the worker are cleared and the step stays on the day.
- Save of a past start stays on the caller step. The modal stays open. The error is `To vrijeme je već prošlo.`
- `createPhoneBooking` returns `PAST_TIME` for a start before now, including a date before today. Hours, break, closed day, overlap, and worker checks stay.
- Sutra and a later day are unchanged aside from that date minimum.
- Pošalji zahtjev stays as it is, including a day-only send on an open day when every quarter is past.

STORY-95 supersedes the STORY-76 lines that a past date still saves and that earlier today is included, and the STORY-74 line that a time earlier today is allowed. Those files stay as history.

## Out of scope

- A ticking clock
- Guest picker and `createBooking`
- Accept, assign worker, counter-propose, and reschedule
- Rows already saved
- The assistant
