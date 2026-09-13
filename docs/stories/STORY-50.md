# STORY-50 — Salon catalog and OwnerNav Saloni

| Field | Value |
|-------|--------|
| ID | STORY-50 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `STORY-50` |
| Depends on | STORY-01, STORY-04, STORY-41, STORY-43 |

## User story

As an owner, I want a salon catalog of shops I own with whether each is open now, so that I can see all my shops without treating the switcher as a directory.

## Acceptance criteria

- `/owner/salons` is a lazy owner route (same overlay top-nav as other `/owner*`: name + Odjava; logged-out AuthShell with Panel heading). OwnerNav **Saloni** is on every owner route (`/owner`, chats, stats, request detail, this catalog). Switcher stays `?salon=` on queue, chats, and stats only — not on the catalog.
- The catalog lists every salon the session owns. Each row: name + **open now** derived from that salon’s working hours (inside today’s open interval and not in a break). Closed weekday, break, or no hours → not open now. Not listed, not a manual toggle.
- Zero salons: same not-owner treatment as `/owner` (existing link to `/create-salon`). Do not change `/create-salon`.

## Out of scope

- Add salon (`/owner/salons/create`, STORY-52)
- Salon edit (`/owner/salons/:id`, STORY-51)
- Current job labels (STORY-49)
- Listed chip, photos, coordinates
