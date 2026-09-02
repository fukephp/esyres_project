# STORY-18 — My Bookings

| Field | Value |
|-------|--------|
| ID | STORY-18 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | `E4-my-bookings` |
| Depends on | STORY-10 |

## User story

As a customer, I want to see all my requests (Pending / Time Proposed / Confirmed / Declined) in one place, so that I can track their status.

## Acceptance criteria

- Session customer lists only their bookings, all four statuses, newest first; each row has salon name, status, preferred date/time, duration, worker, proposed time/worker, decline reason, services.
- Empty → empty list; other customers omitted; guest unauthenticated; unverified email or phone still lists; bad paging rejected.
- Time-proposed clock shown is the proposed time + worker; otherwise preferred time + worker.
- Logged-in `/bookings`: flat list with Bosnian status labels; empty copy; verify panels above the list; rows not tappable for respond yet.

## Out of scope

- Approve / reject / ask other time (STORY-19)
- Cancel / reschedule (STORY-29, STORY-30)
- Status filter argument / infinite scroll
- Favorites, customer profile
- `/booking/:id`
