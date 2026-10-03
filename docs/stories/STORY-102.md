# STORY-102 — Favorite salon

| Field | Value |
|-------|--------|
| ID | STORY-102 |
| Epic | 8 — Trust Signal Data Foundations |
| Loop | — |
| Depends on | STORY-100 |

## User story

As a customer, I want to save a salon from its page and see those salons on my profile, so that I can return without searching.

## Acceptance criteria

- A logged-in customer sees **Sačuvaj** / **Sačuvano** on `/salon/:id`. A guest does not. No email or phone gate.
- Sačuvaj creates a Favorite of that one salon. Sačuvano removes that bookmark and leaves any QR visit.
- QR reconnect still creates a Favorite with no tap.
- `/my-profile` lists **Omiljeni saloni**. Each row links to `/salon/:id` and can unsave. Empty copy when there are none.
- A Favorite is not a worker, a service, or a rating.

## Out of scope

- Hearts on discovery cards
- Worker or service bookmarks
- Predloženi saloni (STORY-103)
