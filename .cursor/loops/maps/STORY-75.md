# Story map: STORY-75

> Wayfinder-lite planning artifact. Fog is clear. Draft key is `.cursor/loops/answer-keys/STORY-75.md`.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-75 |
| Source | `docs/stories/STORY-75.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-75.md` |

## Destination

OwnerNav **Zapisi** at `/owner/zapisi` lists one salon’s bookings for one day, every status, filterable by origin (Svi / Gost / Asistent / Telefon) and day. Each row opens Request Detail and returns there. In-flight chats stay off this list.

## Notes

- Approved 2026-09-29: all six recommendations (path under Zahtjevi, one row on the appointment day, Svi default, native Datum, Nazad back to Zapisi, mount refetch only).
- Origin is already stored: `picker` / `assistant` / `phone`. `customerName` is the caller name on a phone booking, otherwise the person name.
- Clock and status words follow existing booking copy (`formatSarajevoTime`, `bookings.status.*`).

## Decisions so far

- Path `/owner/zapisi`. OwnerNav link directly under Zahtjevi, before chat. `active="zapisi"`.
- This salon only, `?salon=` like Zahtjevi (omit or bad id → first owned `id` ASC). Switcher keeps the day and the origin chip. Not a chain list. Not settings. Catalog stays without `?salon=`.
- One row on the appointment day: `requested` / `declined` / `cancelled` use `preferred_date`; `time_proposed` uses the proposed start’s Sarajevo date; `confirmed` uses the preferred start’s Sarajevo date, including when a reschedule overlay exists. The overlay day stays on Zahtjevi only.
- Time on the row is that same start, Sarajevo `HH:mm` via `formatSarajevoTime`. Sort by that instant ascending, then `id` ascending.
- Status words reuse `bookings.status`: Na čekanju, Potvrđeno, Predloženo vrijeme, Odbijeno, Otkazano.
- Chips **Svi** (default, omit `origin`) / **Gost** / **Asistent** / **Telefon**. Query values `picker`, `assistant`, `phone`. Unknown `origin` is Svi. One chip at a time. Keeps day and salon.
- Native date field, label **Datum**, default Sarajevo today. Omit `date` when it is today. Bad `date` falls back through `ownerDateFromSearch`. Not a month navigator.
- Statuses: `requested`, `confirmed`, `time_proposed`, `declined`, `cancelled`. In-flight chats that never became a booking are absent.
- Row fields: time, origin, name (person or caller), service snapshot names (`currentJobLabel`), status. No worker column. No new cancel action.
- A cancelled Telefon row stays the existing phone-booking cancel on Request Detail. A cancelled Gost row stays the customer cancel. Both show **Otkazano** on the list.
- Empty day after the origin filter is an empty list. No empty-state sentence.
- Row link `/owner/requests/:id?from=zapisi` plus the same `date` / `salon` / `origin` query the list uses. **Nazad** rebuilds `/owner/zapisi` from that. Zahtjevi rows omit `from` and still return to Zahtjevi.
- Refetch when the page mounts. No new subscription.
- Owner shell matches Zahtjevi (TopNav, aside, OwnerNav, same logged-out / unverified / not-owner returns). h1 **Zapisi**.

## Open decisions

## Not yet specified

## Out of scope

- Telefon wizard (STORY-74)
- Voice recording, bubble transcript, training an agent
- Filters other than origin and day
- In-flight chat rows
- New booking statuses, trust counters, or cancel rules
- A second row on the reschedule day
- Month navigator on this page
- Live subscriptions
