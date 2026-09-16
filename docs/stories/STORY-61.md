# STORY-61 — Owner day card (hours down, worker columns)

| Field | Value |
|-------|--------|
| ID | STORY-61 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `STORY-61` |
| Depends on | STORY-13, STORY-14, STORY-15, STORY-16, STORY-42, STORY-49 |

## User story

As an owner, I want this salon-day (queue + job board) in one Cal card with hours down and workers as columns, so that I can read the day without a one-line 15-minute strip.

## Acceptance criteria

- `/owner` home puts that salon-day in **one** white `{colors.canvas}` card spanning owner `main` (`{rounded.lg}` 12px, hairline, padding). Not a ~480px guest widget. No heavy shadow. No grey fill on the whole box. Aside + OwnerNav unchanged.
- Card header: Bosnian weekday + date (e.g. `srijeda, 16. septembar 2026`); previous/next day chevrons (`aria-label` `Prethodni dan` / `Sljedeći dan`); native `type=date` is a secondary icon/input in that row. No `Danas` badge. No now-line. No month grid.
- While the afternoon scrolls, the **date row** and **worker names** stay pinned. The queue does **not** pin.
- Queue sits **inside** the card, then the board. Empty copy inside: `Nema zahtjeva za ovaj dan.` Closed / no workers copy inside: `Zatvoreno ovaj dan.` / `Nema radnika.` Off/break cells stay `cell-off`.
- Queue items are Cal-like chips on `{colors.surface-soft}`: initial circle (ink letter on soft grey — not orange, not `cell-free`); **name · services**; muted **duration · preferred time · worker or Bez preferencije**; existing tags (`Uskoro` / `Premještaj` / `Asistent`); then the same `Prihvati` / `Odbi` / `Predloži` (and `Zadrži stari` on reschedule). Whole chip stays draggable. `Predloži` still goes to `/owner/requests/:id`. Action labels and error strings unchanged.
- Board: hours run **down**; each worker is a **column**; label **every 15 minutes**. Occupying jobs are vertical blocks (height = duration), service snapshot names wrap, `title` tooltip stays. Extra workers pan horizontally; time column sticky left. The card **grows** with open hours; the page scrolls (16:45 is not clipped inside a fixed widget).
- Cell tokens unchanged. Mutations unchanged (`acceptPreferredTime`, `proposeTime`, decline, reschedule accept/dismiss). Drag + page auto-scroll; tap fallback unchanged. Occupancy unchanged (`requested` does not occupy).

## Out of scope

- Guest Cal.com widget (month grid + time pills replacing cells)
- Now-line, `Danas` badge, sticky queue, worker tabs, KPI cards
- Changing accept / drag / tap-fallback / decline / reschedule API
- Worker login (Phase 2)
- Customer slot grid
