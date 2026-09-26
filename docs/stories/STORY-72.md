# STORY-72 — Request Detail memory

| Field | Value |
|-------|--------|
| ID | STORY-72 |
| Epic | 8 — Trust Signal Data Foundations |
| Loop | — |
| Depends on | STORY-35, STORY-70 |

## User story

As an owner, I want this guest's other confirmed bookings and a no-show mark on Request Detail, so that I know who already came before I accept, without a customers screen.

## Acceptance criteria

- `/owner/requests/:id` lists other confirmed bookings for this customer at this salon, newest first, no pager. Each row shows the date, service snapshot names, and **Nije došao** when `noShowAt` is set. The open request is excluded. Cancelled, declined, and still-requested stay out. Another customer’s confirmed booking stays out. Another salon stays out.
- The list is on the pending form and on occupying read, under the customer meta. Empty copy is **Nema ranijih termina.** Heading is **Raniji termini.** Omit the block when no booking loaded.
- **Nije došao** on the open card calls existing `markNoShow`. Shown only when the row is confirmed and the start has passed and it is not already stamped. One tap, no confirm, hairline button. After a stamp the button is gone and the label shows. Status stays `confirmed`. A second mark does not increment again.
- Zahtjevi occupying row shows **Nije došao** when that row is stamped. It still occupies. Not a new status.
- No `/owner/customers`. No notes. No QR-visit chrome. No phone or email on the list.

## Out of scope

- Customer History screen, client notes, allergy notes
- QR visit marker on the panel
- Counter-propose from the till-pile
- Payments, deposits, no-show fees
- Unmark / undo
