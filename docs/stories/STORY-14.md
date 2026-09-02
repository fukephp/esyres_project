# STORY-14 — One-tap accept

| Field | Value |
|-------|--------|
| ID | STORY-14 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `E3-one-tap-accept` |
| Depends on | STORY-13, STORY-09 |

## User story

As an owner, I want to accept a guest’s preferred time in one tap when it works, so that simple requests don’t need an extra back-and-forth.

## Acceptance criteria

- Verified owner accept on a requested row with a named worker → confirmed at the preferred time; owner-responded stamped once; row leaves the pending queue.
- No-preference worker → rejected as worker required. Already confirmed or not requested → rejected. Missing booking / other salon / guest / unverified owner rejected. Failed accept does not stamp owner-responded.
- Same worker overlapping the preferred range with confirmed or time-proposed → slot taken; adjacent ranges succeed; different workers at the same time both succeed; another requested row does not occupy until accepted.
- Named-worker row shows Prihvati; no-preference row does not.

## Out of scope

- Counter-propose and decline (STORY-15, STORY-17)
- Worker Availability Panel / drag grid
- Request Detail
- Hours/break validation on accept
- Status notifications (Epic 6)
