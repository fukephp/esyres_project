# STORY-83 — Sarajevo clock labels

| Field | Value |
|-------|--------|
| ID | STORY-83 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | — |
| Depends on | STORY-18, STORY-29, STORY-70, STORY-75, STORY-80 |

## User story

As a guest or an owner, I want booking clocks to already be Sarajevo hours when they arrive, so that the screen does not shift a time I picked.

## Acceptance criteria

- A booking exposes three Carbon display labels in `Europe/Sarajevo`, `HH:mm`: the preferred start, the proposed start when one is set, and the reschedule start when one is set. September (UTC+2) and January (UTC+1) both show the Sarajevo wall time. A preferred start of 15:00 Sarajevo displays `15:00`.
- The existing ISO instants stay. Storage stays UTC. `APP_TIMEZONE` stays `Europe/Sarajevo`. No new datetime package.
- Zahtjevi (Kalendar and Kanban), Request Detail, Zapisi, and My Bookings render those labels for the three clocks. They do not rezone those instants in the browser.
- The calendar day beside a clock stays the stored date (`preferred_date`, and the proposed or reschedule date). It is not recomputed from the instant in the browser.
- Weekday names, “today”, and other helpers that are not those three clocks stay as they are.

## Out of scope

- Quarter starts on Pošalji zahtjev (STORY-84)
- Reformatting salon hours, breaks, or the Telefon pills
- Replacing ISO fields, or formatting `created_at` and the other timestamps
