# Story map: STORY-67

> Wayfinder-lite planning artifact. Copy to `.cursor/loops/maps/STORY-xx.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-67 |
| Source | `docs/stories/STORY-67.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-67.md` (after compile) |

## Destination

`/owner` is one Cal card: month navigator (occupying-only worker-colored dots) plus a selected-day list (pending till-pile, soon occupying, rest + Pauza / Zatvoreno). No 15-minute board, no drag, no `@dnd-kit`. Counter-propose stays Request Detail `Predloži`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`, `docs/architecture/08-Decisions.md` #29 #32 #42, `docs/adr/0035-zahtjevi-month-and-selected-day-list.md`, `docs/stories/STORY-67.md`
- Skills: `.cursor/skills/custom-feature-skills/SKILL.md`; grilling rounds; grill-with-docs when terms/ADRs lock
- Code today: `OwnerHome.tsx` still STORY-61 day card + `@dnd-kit` + `WorkerPanel`. `occupyingBookings(salonId, date)` is one Sarajevo day (resolver already loads all occupying then filters). Request Detail is worker + time selects, not a board. `pendingBookings` default 20, `ListPage::MAX_LIMIT` 50. Occupying resolver `take(100)`.
- Standing preferences: smallest GraphQL change; Bosnian-first; Design 1 only; mutations unchanged
- Grill 2026-09-17 round 1: Q1–Q6 all A; round 2: Q7–Q9 all A; round 3: Q10 A

## Decisions so far

- Supersedes STORY-61 `/owner` chrome, STORY-15 `/owner` drag, STORY-49 occupying **cells** on Zahtjevi home. Occupancy rules unchanged (`requested` does not occupy; `confirmed` + `time_proposed` do). Mutations unchanged.
- One white `{colors.canvas}` hairline `{rounded.lg}` card spanning owner `main`. Aside + OwnerNav unchanged. `?salon=` unchanged. `?date=` stays the selected Sarajevo day (`ownerDateFromSearch`).
- No Cal week/day/agenda. No dual-mode board. No STORY-61 day chevrons, native `type=date`, now-line, or `Danas`. No empty-cell create. No `@dnd-kit` on `/owner`. Remove `@dnd-kit/core` from `esyres_app/frontend/package.json`. Delete `WorkerPanel.tsx` (Request Detail never imported it).
- Request Detail stays STORY-16 form (`proposeTime` 15-minute, hours-bounded, same-day). Keep per-day `occupyingBookings(salonId, date)` there for `proposeStartTimes`.
- Dots: occupying only, start-time order, max three per day. Unassigned pending (`Bez preferencije`) has no dot. Not customer 🟢/🟡/🔴. Not `cell-booked` as the only color.
- `md+` two columns (navigator left, list right). Phone: navigator stacked above the list. Selected-day chrome: Bosnian weekday + numeric date (not `formatOwnerDayHeading` year-long form). Selected day uses Cal ink/primary, not screenshot blue.
- Pending: existing row fields/actions/tags; sort unchanged (STORY-13). Count > 2: collapsed disclosure, header includes count, expand shows every fetched pending row. Count 0–2: all visible, no disclosure. Count 0: no till-pile chrome.
- Soon occupying: `isPreferredSoon` (start past or within two hours). Heading `owner.soon` (`Uskoro`) only when that group is non-empty. Rest of day: no extra heading; occupying rows + titled `Pauza` mixed by break start; `time_proposed` tagged `Predloženo vrijeme`; current job = service snapshot names, clock range, worker. Tap occupying → Request Detail.
- Closed weekday: after pending, one `owner.closedDay`. Open empty day: `owner.empty`. No workers: `owner.noWorkers` (pending still lists if any).
- Subscriptions still refetch queue + occupying (`bookingCustomerResponded`, `bookingRescheduled`, `bookingCancelled`); no `pollInterval`.
- Cell tokens unused on Zahtjevi home (ADR 0035). Rewrite `ownerPanel.source.test.ts` / `designPack.test.ts` board assertions.
- **Q1 A** Chevron only changes visible month (local year+month). `?date=` unchanged until a day cell is tapped. Init visible month = month of selected `?date=`. If `?date=` later lands outside the visible month (back from Request Detail), snap visible month to contain it. Chevron does not snap back.
- **Q2 A** Current-month days only. No adjacent-month pad cells. Occupying dots fetch is the 1st through last day of the visible calendar month.
- **Q3 A** Hash `worker.id` into 8 Design 1 colors: `badge-orange`, `badge-pink`, `badge-violet`, `badge-emerald`, `brand-accent`, `success`, `warning`, `error`. Same color on that day’s dots and occupying-row marks. Unassigned pending: no dot. Not busy-free/moderate/busy.
- **Q4 A** Native `<details>` when pending count > 2, default closed, summary `Zahtjevi (N)` (`owner.title` + count). 0–2: unwrapped. 0: no till-pile chrome.
- **Q5 A** Week starts Monday. Sunday is the last column. Header labels from existing `weekday.*` (full names).
- **Q6 A** OwnerHome `pendingBookings` `limit: 50` only. Do not raise `ListPage::MAX_LIMIT`. Till-pile count is the fetched list length.
- Month chevrons: new copy `owner.prevMonth` / `owner.nextMonth` (`Prethodni mjesec` / `Sljedeći mjesec`). Do not reuse `owner.prevDay` / `nextDay`. Month title: `Intl` `bs-BA` long month + year.
- **Q7 A** New `occupyingBookingsRange(salonId: ID!, from: String!, to: String!): [Booking!]!`. Inclusive Sarajevo Y-m-d. Same occupancy + `OwnerAccess` + `take(100)` after range filter. `INVALID_DATE` if either bound is bad or `from > to`. Keep `occupyingBookings(salonId, date)` for selected-day list + Request Detail `proposeStartTimes`. OwnerHome dots use range (`YYYY-MM-01` … last day of visible month). Subscriptions refetch pending + per-day occupying + range.
- **Q8 A** Selected-day title is `t('weekday.' + sarajevoWeekday(date))` + `formatPickerDayNumeric(date)` (e.g. `Četvrtak, 17. 9. 2026`). Drop `formatOwnerDayHeading` on `/owner`. Keep the helper in `owner.ts` (tests stay).
- **Q9 A** Occupying rows are hairline (`border-hairline`) list rows, not pending chips. Worker color mark + `currentJobLabel` + clock range + worker name; `t('bookings.status.TIME_PROPOSED')` when `TIME_PROPOSED`. Whole row is a control to Request Detail. Pending chips unchanged (no `useDraggable`).
- Weekday headers use existing `weekday.*` (full Bosnian names, Monday first). Blank non-tappable slots only to align the 7-column grid (not adjacent-month dates).
- **Q10 A** Occupying row is `Link` to `/owner/requests/:id`. `ownerDetailMode(status)`: `REQUESTED` → existing form; `CONFIRMED` / `TIME_PROPOSED` → read-only (name, services, occupying clock, worker, Nazad; no Predloži / Prihvati / Odbi); else bounce `owner.acceptError.NOT_REQUESTED`. Extend `OWNER_BOOKING_QUERY` with `proposedStartsAt` + `proposedWorker { id name }` for the read clock. `ownerBooking` resolver unchanged (already returns confirmed).

## Open decisions

- (empty)

## Not yet specified

- (empty)

## Out of scope

- Cal week / day / agenda; dual-mode 15-minute board
- Empty-cell create booking; owner-created appointments
- Per-worker calendar filter or shift editor
- Changing accept / propose / decline / reschedule mutation contracts
- Screenshot Past Event column, pagination, Cal.com blue selected day
- Worker login (Phase 2)
- Customer slot grid
- In-flight chat tab (STORY-26)
- STORY-64 (no story file)
