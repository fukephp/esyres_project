# STORY-76 — Telefon modal

| Field | Value |
|-------|--------|
| ID | STORY-76 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | `STORY-76` |
| Depends on | STORY-74 |

## User story

As an owner, I want Telefon as modal steps on Zahtjevi, with Danas, Sutra, or another day and tappable quarter-hour starts, so that I can write a phone booking with a few taps while I am still on the call.

## Acceptance criteria

- Zahtjevi shows **Telefon** for the salon already in context (same `?salon=` as Zahtjevi). It opens a modal over the queue. One step at a time. Phone sheet, card from `md` up, same dialog family as the guest picker. **Zatvori** or a finished save closes it. Backdrop, Escape, and the date or time popup do not. The first step has no Nazad. A salon switch drops the draft and closes the modal. `/owner/phone` redirects to Zahtjevi for the same salon and day and does not open the modal. Not an empty cell on the day list. Not a worker login.
- Each open starts blank. Steps, in order: one or more services, under that salon’s category headings (checkboxes; none is rejected); a day and a start; a worker; caller name, required (blank or whitespace is rejected); phone, optional loose text, trimmed, empty allowed, not a user phone, not unique, and not OTP; note, optional plain text, empty allowed.
- Day chips are **Danas**, **Sutra**, and **Drugi dan**. The window is Sarajevo today, not the day already selected on Zahtjevi. The first time the day step opens, it selects the first day from today through the next 6 days that has a legal start. Today selects Danas. Tomorrow selects Sutra. A later day selects Drugi dan with an empty date and an empty time, and does not store that later day. If none of those 7 days have a legal start, Danas stays selected, with no pills. A later tap on Danas, Sutra, or Drugi dan stays on that chip even when it has no pills. The skip does not look at yesterday.
- Drugi dan reveals a native date with no minimum and a native time on the quarter. Both start empty. Choosing today or tomorrow in the date field selects Danas or Sutra and hides both fields. Tapping Drugi dan clears the date, the start, and the worker. A time is checked as soon as it is set against that day’s occupying rows: booked, break, closed, outside hours, or not a quarter shows the existing error and Dalje stays off. A past date still saves when that weekday was open and a legal start exists.
- A legal start is a clock quarter (`:00`, `:15`, `:30`, `:45`) whose range fits that day’s open hours, does not sit in or span the break, and has at least one worker free for the whole range. The range is the start plus the service durations, summed and rounded up to 15 minutes, same as any booking. Earlier today is included. Danas and Sutra pills are chronological and none is pre-selected. Every in-hours quarter is shown. A quarter with no free worker stays visible, disabled, and labeled Zauzet. Drugi dan does not show pills. Off-grid minutes are not a legal start. A closed day shows `Salon je zatvoren taj dan.` An open Danas or Sutra with no in-hours quarter shows `Nema slobodnog termina.`
- Changing the day clears the start and the worker. Changing services clears the start and the worker only when the old start no longer fits, keeps the day, and does not run the skip again. If that day then has no legal start, it shows the empty line for that day.
- The worker step lists name taps of workers free for the chosen start. Exactly one free name is already selected. Several names start with none selected. If none remain, it shows `Nema slobodnog radnika.` and Dalje stays off.
- Save creates a confirmed phone booking with no customer user. A matching customer phone does not attach the booking. It is not `requested` and it is not counter-proposed. It occupies that worker. Busy-level and basic stats include it the same way as any confirmed booking. After save, the modal closes and Zahtjevi opens on that day with a normal occupying row (service snapshot names and worker). The month grid moves to that month and refetches that day’s occupying rows, that month’s dots, and that day’s queue. Server rules for a closed day, outside hours, the break, and overlap stay as they are.
- Request Detail, owner cancel, and no-show stay as STORY-74 left them.

## Out of scope

- A 15-minute worker board, drag, or an hour-cell grid
- Autofill of the next free start, last-caller memory, and a mid-call soft-hold
- Voice recording, a bubble transcript, and an agent that books from audio
- Worker login and receptionist roles
- Owner reschedule (cancel and write a new phone booking)
- Empty-cell create on the day list
- Linking the caller to a customer user
- Push, SMS, or email for this booking
- Changing the create-phone-booking server contract
