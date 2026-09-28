# Story map: STORY-74

> Wayfinder-lite planning artifact. Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-74 |
| Source | `docs/stories/STORY-74.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-74.md` (after compile) |

## Destination

An owner writes a phone booking from Zahtjevi for the salon already in context. It is born `confirmed`, has a caller and no customer user, occupies a free worker, and Zahtjevi opens on that day. Request Detail shows the caller and can cancel the booking before the start.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-74.md`, `docs/adr/0038-phone-booking-without-customer.md`, `docs/architecture/05-Data-Model.md`, `docs/mvp/03-Key-Features.md`, `docs/glossary.md` (Phone booking, Caller, Booking origin, Phone booking cancel)
- Zahtjevi already reads `date` and `salon` via `ownerDateFromSearch` / `ownerSearchParams` (`esyres_app/frontend/src/lib/owner.ts`). Guest `createBooking` is the customer path (`EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` / `PAST_TIME`).
- Skills: custom-feature-skills while implementing; this map is the grill. Do not start coding until the key is approved.
- Standing preferences: Bosnian `bs` only; reuse existing hour/overlap checks; do not infer a phone booking from a null `customer_id`.

## Decisions so far

- Born `confirmed`. No customer user, even when the caller phone matches a user. Not `requested`. Not counter-proposed. `owner_responded_at` stays unset. No reminder mail. No push, SMS, or email on save.
- Occupies that worker like any confirmed booking. Busy-level and basic stats include it the same way. Half-open ranges. Workers inherit salon hours. Duration is the service sum rounded up to 15 minutes.
- Inputs, in order: one or more services under that salon’s category headings (none rejected); a day and a time not taken from the Zahtjevi selected day (earlier today allowed); a required worker who is free for the range; required caller name (blank or whitespace rejected); optional loose phone (trimmed, empty allowed, not a user phone, not unique, not OTP); optional plain note (empty allowed).
- Save rejects: closed day, outside that day’s working hours, range in or spanning the break, overlap with `confirmed` or `time_proposed` on that worker, no free worker. No double-book.
- After save, Zahtjevi opens on that day with a normal occupying row (service snapshot names and worker).
- Request Detail shows caller name, phone, note, and the saved choices. No other-bookings memory. No customer cancel, no reschedule, no My Bookings row.
- Owner cancel is only on a phone booking, from that detail, two steps, no reason, only before the start. Status `cancelled`. Range frees. No trust counters. No late-cancel warning. After the start, cancel is refused.
- No-show stays the existing Request Detail action after the start. Status stays `confirmed`. Salon no-show counter increments. Customer counter does not. A second mark does not increment again.
- The worker is the stylist. The signed-in owner is who wrote it. Not a modal, not an empty cell, not a worker login. Same `?salon=` as Zahtjevi.
- Route is `/owner/phone`. `?salon=` only when this salon is not the first owned shop (same rule as Zahtjevi). Do not copy the Zahtjevi `date` in. After save, open `/owner` on the saved day via `ownerSearchParams`.
- **Telefon** is a text button on the right of the Cal card, on the row above the month/list split. Not an OwnerNav item, not a month cell, not a modal. It carries the same salon context as Zahtjevi.
- Four screens, one at a time, values kept when going back. (1) services (2) day and time (3) worker (4) caller name, phone, and note, then **Spremi**. **Nazad** / **Dalje** between screens.
- Request Detail: in-card name is the caller name. Phone and note render under it; omit a line when empty. Services, day, time, and worker are the saved choices. Omit **Raniji termini**. No accept, decline, or propose. Before the start: two-step **Otkaži termin**, no reason, confirm **Otkaži**. After the start: cancel is absent and **Nije došao** stays.
- `origin` is `picker`, `assistant`, or `phone`. Guest `createBooking` writes `picker`. Attaching an intake writes `assistant`. The phone mutation writes `phone`. Backfill: `assistant` when a converted intake points at the row, otherwise `picker`. A null customer is not “phone.”
- A rejected save stays on the last step. One Bosnian line under **Spremi**. Reuse `SALON_CLOSED`, `OUTSIDE_HOURS`, `SLOT_TAKEN`, and `INVALID_WORKER`. New codes only for a blank caller name (`INVALID_CALLER_NAME`, **Unesi ime.**) and for a range in or spanning the break (`DURING_BREAK`, **Termin pada u pauzu.**). Do not use `PAST_TIME`.
- Page h1 is **Telefon**. **Nazad** above the card returns to Zahtjevi (same salon, the day Zahtjevi was on, draft discarded). On steps 2–4, **Nazad** goes to the previous step and keeps values. **Dalje** advances and stays disabled until that step is valid. Step 4 uses **Spremi**.
- Headings: **Usluge**, **Dan i vrijeme**, **Radnik**, **Pozivalac**. Fields: **Datum**, **Vrijeme**, **Ime i prezime**, **Telefon (opcionalno)**, **Bilješka (opcionalno)**. No “Nema preference”. Empty free-worker list: **Nema slobodnog radnika.** and no **Dalje**.
- The Telefon link may carry `date` so return lands on the Zahtjevi day. The wizard date input starts empty and does not read that param. After save, open Zahtjevi on the saved day.
- Out of this story: Zapisi, voice, worker login, owner reschedule, linking the caller to a user.

## Open decisions

## Not yet specified

## Out of scope

- Zapisi (STORY-75), including OwnerNav **Zapisi**
- Voice recording, a bubble transcript, and an agent that books from audio
- Worker login and receptionist roles
- Owner reschedule (cancel and write a new phone booking)
- Empty-cell create on the day list
- Linking the caller to a customer user
- Push, SMS, or email for this booking
- Zahtjevi diary row chrome (STORY-73)
