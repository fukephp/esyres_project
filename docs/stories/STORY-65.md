# STORY-65 — Send under selected hours row; modal names the day

| Field | Value |
|-------|--------|
| ID | `STORY-65` |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `—` |
| Depends on | STORY-62 |

## User story

As a customer, I want Pošalji zahtjev under the weekday I picked and to see that day named in the picker modal, so that send sits on my choice and I know which date I am requesting.

## Acceptance criteria

- Guest `/salon/:id` hours block order: `Radno vrijeme` heading; helper `Odaberi dan da pošalješ zahtjev.` (stays after a day is selected); seven-row list with `Pošalji zahtjev` **inserted under the selected open weekday row** (later weekdays push down); Pitaj salon card after the full list. **No** pill slot after the seven-row list. STORY-65 supersedes STORY-62 on that order and on modal title-only chrome. Pitaj salon stays after the hours list (STORY-63 card; the old after-list pill slot is gone).
- First open-weekday tap: select row + seed next Sarajevo date. Re-tap selected = noop. Other open day switches. Does **not** open the picker modal. Closed rows stay muted, not tappable. Hours tap while chatting: leave chat, select that day, show the pill under that row (no modal yet).
- Show the pill when `preferredDate` is set, the salon has services, not chatting, and not sent, **and** the matching hours row is tappable (open weekday). If `preferredDate` is a closed weekday: no selected row, pill hidden. Same STORY-48 black pill (Inter 600 14px, min-height 48px, press `#242424` + `scale-[0.98]`, label `Pošalji zahtjev`, no icon). Full width of the hours column. CSS only. No GSAP. One send on the page — not a second smaller control, not a send-icon.
- Pill click still **opens** the picker modal (does not `createBooking`). Close without send keeps the day + pill.
- Booking modal title stays the salon name. Directly under it, a muted line names the seeded day: title-case `weekday.*` + numeric Sarajevo date of `preferredDate` (e.g. `Srijeda, 17. 9. 2026`). Not `formatOwnerDayHeading` (`srijeda, 16. septembar 2026`). Native `type=date` stays. Copy tracks `preferredDate` if they change it.
- Date stays editable. Changing it updates the subtitle, hours selected chrome, and where the pill sits. Closed weekday via the date input: modal **stays open**; no selected row; pill hides; they can still finish services/time/send or pick another date.
- `createBooking`, send gates, picker vs chat mutual exclusion, empty aside, and chat overlay chrome unchanged.

## Out of scope

- Chat overlay weekday subtitle
- Send-icon, smaller second send, instant modal on first day tap
- Day-only skip of services / worker / time
- Filling the empty aside
- Changing `createBooking` or send gates
- Slot grid, sticky TopNav, phone dock, GSAP / Awwwards / Three.js
- Public pricing page
