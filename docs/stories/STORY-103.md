# STORY-103 — Suggested salons

| Field | Value |
|-------|--------|
| ID | STORY-103 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | STORY-100 |

## User story

As a customer, I want a few salons that match a chip I already booked, so that my profile can point me at another shop of that kind.

## Acceptance criteria

- `/my-profile` shows **Predloženi saloni** only when at least one salon qualifies. Otherwise the row is absent.
- Up to 3 listed salons, salon name A–Z. A salon qualifies when one of its services still has the migrate-only chip `HAIR`, `MAKE_UP`, or `MASSAGE` in common with a service on any booking this customer owns.
- Skip a salon they have favorited. Skip a salon where they have a live booking (`requested`, `time_proposed`, or `confirmed`).
- Owner-typed category names do not match. A booking whose categories have no legacy chip adds nothing.
- Each row links to `/salon/:id`. The row is not on `/salons` and not on `/`.

## Out of scope

- A recommendation model
- Matching owner category names across salons
- Showing the row when nothing qualifies
