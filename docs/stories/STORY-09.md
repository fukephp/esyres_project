# STORY-09 — Worker pick

| Field | Value |
|-------|--------|
| ID | STORY-09 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | `E2-worker-pick` |
| Depends on | STORY-08, STORY-03 |

## User story

As a customer, I want to optionally pick a specific worker or say “no preference,” so that I have control when I care, and less friction when I don’t.

## Acceptance criteria

- A guest can read salon workers (id, name) without a session; empty salon → empty list.
- Guest still cannot read cancellation notice hours; owner can still read workers + notice hours.
- Verified customer create-booking with that salon’s worker stores the worker; omitted worker still stores no preference; foreign worker rejected.
- Picking-mode radios: no preference default, then names; hidden when zero workers.

## Out of scope

- Chat worker step (Epic 10)
- Owner panel visual for no-preference vs named (Epic 3)
- Worker↔service assignment, active flag, photos, per-worker hours
- Worker logins
- Changing send gates
