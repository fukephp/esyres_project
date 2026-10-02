# STORY-97 — Request Detail aside

| Field | Value |
|-------|--------|
| ID | STORY-97 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | `STORY-97` |
| Depends on | STORY-90, STORY-91 |

## User story

As an owner, I want Request Detail to slide in from the right over the board without leaving the page, so that I can act on a booking while my week, day, and columns stay where I left them.

## Acceptance criteria

- Tapping a booking card on Zahtjevi (Kalendar and Kanban) or Zapisi opens Request Detail in an aside: a full-height white panel on the right. It is about 440px wide on `md+` and full width on phone. The phone bottom sheet and the `md+` centered card from STORY-90 are gone.
- Opening the aside does not change the URL. The board stays mounted and keeps its route, `?date=`, `?salon=`, origin filter, scroll, week, and Kanban columns. Refresh shows the board with the aside closed. Browser Back works as normal and leaves the board. Opening the aside pushes no history entry.
- A pasted or old `/owner/requests/:id` link redirects to Zahtjevi on that booking's day and salon, with the aside open on that booking.
- The board behind is dimmed by a backdrop and cannot be clicked. The backdrop fades in and the panel slides in from the right over about 250ms ease-out. Under reduced motion both only fade, with no slide.
- The X icon in the aside header (aria-label `Zatvori`), a click on the backdrop, and Escape close the aside. The board shows as it was.
- The header shows the customer name, that mode's clock, and the X. The body scrolls inside the panel. The content keeps today's modes and copy: form for `requested`, read for occupying (`confirmed` / `time_proposed`), and bounce otherwise. Accept, assign worker, decline, counter-propose, no-show, phone-booking cancel, the Asistent tag, the collapsed transcript, and other-bookings memory are unchanged.
- Accept, assign worker, decline, and counter-propose leave the aside open on the updated booking. The board behind refreshes. The salon switcher stays hidden while the aside is open. There is no **Nazad**.
- Loading and auth stay uncarded inside the aside. FORBIDDEN or a missing row shows the bounce copy inside the aside. The aside is never an empty panel.
- The aside is one reusable component. Only Request Detail uses it in this story.

STORY-97 supersedes the STORY-90 lines on the modal shell (phone sheet, `md+` card) and on `/owner/requests/:id` as the open route. That file stays as history.

## Out of scope

- Telefon (stays a modal)
- Guest Pošalji zahtjev picker (stays a modal)
- Other owner modals moving to the aside
- Changing accept, assign, propose, decline, or no-show rules
- Deep links that reopen the aside after refresh
