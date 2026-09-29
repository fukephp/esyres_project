# STORY-80 — Kalendar and Kanban on Zahtjevi and Zapisi

| Field | Value |
|-------|--------|
| ID | STORY-80 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-79, STORY-67, STORY-75, STORY-76 |

## User story

As an owner, I want Zahtjevi and Zapisi to show my week as a calendar or my day as a status board, so that I can see load and pipeline without tapping day by day.

## Acceptance criteria

- Zahtjevi and Zapisi render `me.ownerView`: `CALENDAR` → Kalendar, `KANBAN` → Kanban.
- **Zahtjevi Kalendar:** week header with chevrons (Monday–Sunday containing `?date=`; chevrons move `?date=` by 7 days). `md+`: seven day columns; head is weekday + date, selected day pink, closed days say Zatvoreno. Each column lists that day's occupying bookings (`occupyingBookingsRange` for the week) as pastel cards stacked by start: yellow confirmed, blue Predloženo vrijeme; card shows start–end, current job, worker dot + name, and no-show tag; tap → Request Detail. Tapping a day head selects it. Phone: seven day chips + only the selected day's column. Below the grid: the selected day's pending queue (pink cards, same accept / Predloži / Odbij / keep-original rules as today).
- **Zahtjevi Kanban:** seven day chips for the week + chevrons. Four columns for the selected day: **Zahtjevi** (pending queue, pink, with actions), **Predloženo** (`TIME_PROPOSED`, blue), **Potvrđeno** (`CONFIRMED` whose start is not past, yellow), **Završeno i otkazano** (`DECLINED`, `CANCELLED`, and `CONFIRMED` whose start is past, grey). Head shows a count. Phone: columns scroll horizontally with snap. Cards other than pending link to Request Detail.
- **Zapisi Kalendar:** origin chips + day chips; the selected day as a time-ordered list of pastel status cards. **Zapisi Kanban:** same filters; the four status columns from `salonDayBookings`.
- Telefon modal, `?salon=`, subscriptions/refetch, and one-tap accept behave as before. After a Telefon save, Zahtjevi selects that day and refetches.
- No drag, no now-line, no 15-minute board.

## Out of scope

- Moving cards between columns.
- Stats, Chats, Saloni layouts.
