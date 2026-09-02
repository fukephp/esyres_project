# STORY-15 — Drag counter-propose

| Field | Value |
|-------|--------|
| ID | STORY-15 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `E3-drag-propose` |
| Depends on | STORY-13, STORY-03 |

## User story

As an owner, I want to drag a pending request onto an open slot on a worker’s row to counter-propose a different time, so that I can adjust when the preferred time doesn’t fit.

## Acceptance criteria

- Verified owner drag/propose on requested → time_proposed; proposed worker/time set; preferred fields and original worker unchanged; owner-responded stamped once; leaves pending; occupies that worker’s range.
- Auth / not-requested / bad time / not 15-min / past / invalid worker rejected; failed propose does not stamp owner-responded.
- Overlap on the proposed worker with confirmed or time-proposed → slot taken; adjacent succeeds; other worker same time succeeds; requested does not occupy.
- Range not fully inside that weekday’s open-minus-break → outside hours. Accept preferred time still has no hours check.
- Occupying list for a salon-day is confirmed + time_proposed only.
- `/owner`: queue above workers × 15-minute grid; drop on a free start cell always counter-proposes (never accept).

## Out of scope

- Request Detail / tap form (STORY-16)
- Decline (STORY-17)
- Customer respond (STORY-19)
- Status notifications (Epic 6)
- In-flight chat (Epic 10)
