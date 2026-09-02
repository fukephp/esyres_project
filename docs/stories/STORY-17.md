# STORY-17 — Decline request

| Field | Value |
|-------|--------|
| ID | STORY-17 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `E3-decline` |
| Depends on | STORY-13 |

## User story

As an owner, I want to decline a request with an optional reason, so that the customer understands why without me needing to propose a time first.

## Acceptance criteria

- Verified owner decline on requested (named worker or no preference) → declined; optional reason trimmed; omit/blank → null reason; too long rejected and status stays requested; owner-responded stamped once on success.
- Declined row leaves pending and does not occupy a slot.
- Guest / unverified / other salon / not requested rejected.
- `/owner` every pending row has Odbi; expand → optional reason + confirm / cancel.

## Out of scope

- Request Detail (STORY-16)
- Changing accept or propose
- Status notification job (Epic 6)
- Customer-facing decline copy beyond storing the reason
