# STORY-67 — Zahtjevi month navigator and selected-day list

| Field | Value |
|-------|--------|
| ID | `STORY-67` |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | `STORY-67` |
| Depends on | STORY-13, STORY-14, STORY-15, STORY-16, STORY-17, STORY-42, STORY-49, STORY-61 |

## User story

As an owner, I want Zahtjevi as a month navigator with worker-colored occupying dots and a selected-day list (pending till-pile, then soon, then the rest), so that I can run the day from a phone-friendly clock without dragging onto a 15-minute board.

## Acceptance criteria

- `/owner` (Zahtjevi) is one white `{colors.canvas}` hairline card (`{rounded.lg}` 12px; no heavy shadow; no grey fill on the box) spanning owner `main`. Aside + OwnerNav unchanged. STORY-67 **supersedes** STORY-61 `/owner` chrome, STORY-15 `/owner` drag, and STORY-49 occupying **cells**. Occupancy rules unchanged: `requested` does not occupy; `confirmed` and `time_proposed` do. Mutations unchanged (`acceptPreferredTime`, `proposeTime`, `declineBooking`, `acceptReschedule`, dismiss overlay).
- **Month navigator** (Cal month grid, not a guest month-and-pills widget): Bosnian month + year; prev/next month chevrons; weekday headers. Default selected day is Sarajevo today; the visible month contains that day. Tap a day to select it (including closed weekdays). Empty cells never create a booking. No Cal week/day/agenda switcher. No dual-mode back to the 15-minute board. No STORY-61 day chevrons, native `type=date`, now-line, or `Danas` badge. No screenshot “Past Event” column. No list pagination.
- **Dots** mark occupying bookings only (`confirmed` + `time_proposed`). Requested never appears on the grid. One dot per occupying booking on that day, start-time order, **max three**; extra occupying that day are not extra dots. Dot color is a **stable per-worker** mark (same worker → same color on the grid and on that day’s occupying rows). Not customer 🟢/🟡/🔴. Not `cell-booked` as the only color. Not a per-worker filter and not a shift calendar. Unassigned pending (`Bez preferencije`) has no dot.
- **Layout:** `md+` two columns like the Cal month+list reference (navigator left, selected-day list right). Phone: navigator stacked above the list. Selected-day chrome is that day’s Bosnian weekday + numeric date (not a month-wide “upcoming” feed). Selected day uses Cal ink/primary selected state, not screenshot blue.
- **Selected-day list order** (one salon, selected Sarajevo day):
  1. **Pending queue** (requested + `Premještaj` overlays on the **new** preferred day): existing row fields and actions (`Prihvati` / `Odbi` / `Predloži`; reschedule `Prihvati` / `Zadrži stari`; tags `Uskoro` / `Premještaj` / `Asistent`). Sorted soonest preferred time first (then created), same as STORY-13. Count **> 2**: collapsed disclosure by default, header includes the count; expand shows every pending row. Count **0–2**: all rows visible, no disclosure. Empty pending: no till-pile chrome (do not show a 0-count collapse).
  2. **Soon occupying** — occupying whose start is past or within two hours (`Uskoro`). Skip the heading when none.
  3. **Rest of the day** — remaining occupying in start-time order, plus a titled **Pauza** row when that weekday has a break (`Pauza` + until the break end, mixed by break start). `time_proposed` occupying rows tagged `Predloženo vrijeme`. Occupying rows show current job: service snapshot names, clock range, worker. Tap occupying opens Request Detail (existing).
- Closed weekday: after pending, one `Zatvoreno ovaj dan.` row; no fake open-hours occupying. Open day with no pending, no occupying, and no break: `Nema zahtjeva za ovaj dan.` No workers on the salon: `Nema radnika.` (list still shows pending if any).
- Counter-propose is **Request Detail `Predloži` only** (same-day `proposeTime`, hours-bounded, 15-minute steps). `/owner` has **no** drag, no droppable cells, no `@dnd-kit`. Prihvati on named-worker pending stays one tap. No-preference pending still has no Prihvati.
- Month navigator needs occupying for the **visible month** (same occupying rules as today’s per-day list). Selected day still uses that day’s pending + occupying. Subscriptions still refetch queue + occupying (`bookingCustomerResponded`, `bookingRescheduled`, `bookingCancelled`); no `pollInterval`. `?salon=` unchanged.
- Cal Design 1 only. Owner overlay inner unconstrained. Bosnian-first.

## Out of scope

- Cal week / day / agenda views; dual-mode 15-minute board
- Empty-cell create booking; owner-created appointments
- Per-worker calendar filter or shift editor (workers still inherit salon hours)
- Changing accept / propose / decline / reschedule mutation contracts
- Screenshot Past Event column, pagination, Cal.com blue selected day
- Worker login (Phase 2)
- Customer slot grid
- In-flight chat tab (STORY-26)
