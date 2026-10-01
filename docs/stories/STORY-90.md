# STORY-90 — Request Detail modal

| Field | Value |
|-------|--------|
| ID | STORY-90 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-70, STORY-75, STORY-80 |

## User story

As an owner, I want Request Detail as a modal over Zahtjevi or Zapisi, so that I can act on a booking without leaving the board.

## Acceptance criteria

- `/owner/requests/:id` opens as a modal over the board the owner came from. Phone is a sheet. `md+` is a card. The card inside keeps today’s modes and copy: form for `requested`, read for occupying (`confirmed` / `time_proposed`), bounce otherwise. In-card heading stays customer name plus that mode’s clock. Mutations stay `acceptPreferredTime`, `proposeTime`, `declineBooking`, plus no-show and phone-booking cancel. Assistant tag, collapsed transcript, and other-bookings memory stay. A phone booking keeps caller name, phone, note, and the two-step cancel.
- From Zahtjevi, the board behind is Zahtjevi for that booking’s day and salon. From Zapisi, the board behind is Zapisi with the same day, origin filter, and salon. **Zatvori**, backdrop, and Escape close the modal and return to that board. A pasted or refreshed link has no “came from”: the modal opens over Zahtjevi on that booking’s day, and Zatvori returns there.
- Accept, decline, and counter-propose leave the modal open on the updated card. They do not navigate away. Salon switcher stays hidden while the modal is open. There is no **Nazad**.
- Loading and auth stay uncarded. FORBIDDEN or a missing row still shows the bounce copy inside the card. The card is never an empty box.
- Telefon is a different modal and still closes on a finished save.

STORY-90 supersedes the full-page card and **Nazad** in STORY-70. That file stays as history.

## Out of scope

- Assign-worker taps (STORY-91)
- Day-only copy (STORY-92)
- Changing accept, propose, or decline rules
- Customer My Bookings
