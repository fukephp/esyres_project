# STORY-13 — Pending queue

| Field | Value |
|-------|--------|
| ID | STORY-13 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `E3-pending-queue` |
| Depends on | STORY-08, STORY-01 |

## User story

As an owner, I want to see all pending requests for a day in one queue, sorted so urgent ones aren’t buried, so that nothing slips through.

## Acceptance criteria

- A verified owner of the salon lists requested bookings for one Sarajevo calendar day, ordered soonest preferred time first (then created).
- Empty day → empty list; other dates and other salons omitted; guest / unverified owner / other user / bad date / bad page args rejected.
- Each row shows customer name, nullable worker, preferred date/time, duration, service names; `me` exposes owned salons.
- Preferred time in the past or within 2 hours is “soon”; `/owner` defaults to Sarajevo today.
- `/owner` happy path: login → first salon’s queue with time, name, services, duration, worker or no preference, soon cue, empty-day copy.

## Out of scope

- One-tap accept, drag propose, decline, Request Detail (STORY-14–17)
- Worker Availability Panel grid
- Salon switcher chrome (STORY-04)
- In-flight chat tab (STORY-26)
- Status notifications (Epic 6)
