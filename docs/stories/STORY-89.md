# STORY-89 — Always-on Pošalji zahtjev

| Field | Value |
|-------|--------|
| ID | STORY-89 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | — |
| Depends on | STORY-65, STORY-84, STORY-08 |

## User story

As a customer, I want Radno vrijeme to show when the salon is open, and Pošalji zahtjev to open a request I leave only with Zatvori, so that I can ask for a time without the hours list acting as the button.

## Acceptance criteria

- Guest `/salon/:id`, including after `GET /qr/{id}`: name and today’s busy, address when set, then **Radno vrijeme** as a read-only seven-row list (weekday, hours and break, or Zatvoreno). Rows are not buttons. No selected-row chrome. No helper `Odaberi dan da pošalješ zahtjev.` Usluge stay browse-only under their category headings. Today’s busy badge stays on the header. `md+` sticky aside stays empty.
- One STORY-48 black pill, label `Pošalji zahtjev`, full width of the hours column, after the hours list and before Usluge. Hidden when the salon has no services. The pill opens the modal and does not call `createBooking`.
- **Pitaj salon** is not on the profile. The chat dialog does not open from it. The assistant API stays.
- Modal shell stays the guest picker dialog: phone sheet, `md+` card. Title is the salon name. A muted weekday plus numeric date shows when a date is known.
- **Zatvori** (text link) is the only dismiss. Backdrop, Escape, the native date popup, and send leave the modal open. A successful send does not close it. A failed send, including **Već imaš ovu uslugu tog dana.**, leaves it open.
- Logged out: the form is hidden. One line, `Prijavi se ili se registruj da pošalješ zahtjev.`, then AuthShell (login and register). After auth, the form shows. That login does not send.
- Logged in: the form shows immediately.
- One form. Still `createBooking` → `requested`. No caller name and no phone booking. Services (category checkboxes, duration + KM), worker radios with **Nema preference** when the salon has workers, then **Danas / Sutra / Drugi dan**.
- Before any service, the skip uses hours only: the first day from today through the next 6 Sarajevo days that is open and has an in-hours quarter. Ignore Zauzet, past, and duration. Today selects Danas. Tomorrow selects Sutra. A later day selects Drugi dan with an empty date and does not store that later day. If none of those 7 days qualify, Danas stays selected and shows the empty line.
- Quarter pills show only after at least one service, and only once a date is known. Guest rules stay: Zauzet and past are visible and disabled; a `requested` row does not block; no preference is Zauzet only when every worker is blocked; a salon with no workers follows hours, break, close, and past. A closed day shows `Salon je zatvoren taj dan.` An open day with nothing tappable shows `Nema slobodnog termina.` Send stays off in both cases. No typed time.
- Drugi dan is a native date with `min` today, then the same quarter pills. Choosing today or tomorrow switches to Danas or Sutra and hides the date field. Choosing that date does not close the modal.
- Changing day (a chip tap, or that today/tomorrow switch) clears the start and sets the worker back to **Nema preference**. Tapping Drugi dan also clears the date. Changing services keeps the day, does not run the skip again, and clears a start that is no longer tappable.
- Email and phone panels still appear inside the modal when send returns those codes. `APP_ENV=local` still skips them. A finished verify retries send when the form is complete. `UNAUTHENTICATED` on send returns to the login step in the same modal and keeps the draft.
- Success replaces the form with `Zahtjev je poslan. Salon će odgovoriti.` Zatvori stays. One request per open. The page behind does not enter a sent state and does not hide the pill. Zatvori returns to that profile. The next open is a blank draft and the skip runs again.

STORY-89 supersedes the day-tap pill in STORY-65 and the STORY-84 line that Danas, Sutra, and Drugi dan stay on owner Telefon only. Those files stay as history.

## Out of scope

- Owner Telefon (still closes on a finished save, still types a Drugi dan time, still allows a past day)
- Deleting the assistant
- Changing the `createBooking` contract or guest Zauzet rules
- Slot grid, sticky dock, filling the aside
