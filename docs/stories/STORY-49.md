# STORY-49 — Current job on occupying cells

| Field | Value |
|-------|--------|
| ID | STORY-49 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-14, STORY-15 |

## User story

As an owner, I want occupying cells on the Worker Availability Panel to show which service is on that worker, so that the grid is the current-job board.

## Acceptance criteria

- Occupying blocks on `/owner` (confirmed and time-proposed) show that booking’s service snapshot name(s) on the worker’s cells. Worker name stays the row. Existing booked vs proposed cell colors stay.
- Multi-service snapshots join into one label (same names as the request). A request still does not occupy and still has no current-job label.
- No now-only strip, no extra route, no change to the pending queue or Request Detail.

## Out of scope

- Salon catalog / salon edit / add salon (STORY-50–52)
- Worker↔service assignment matrix
- Worker login (Phase 2)
- Changing occupancy rules or 15-minute cells
