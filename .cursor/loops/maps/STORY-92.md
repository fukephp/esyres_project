# Story map: STORY-92

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-92 |
| Source | `docs/stories/STORY-92.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-92.md` |

## Destination

An open day can be sent with no quarter. The row stays `requested` with a day and no clock. The owner offers one same-day quarter with Predloži, or declines.

## Notes

- Consult: `docs/stories/STORY-92.md`, `docs/adr/0043-day-only-request.md`
- Busy-level already sums `duration_minutes` for `requested` rows. A day-only row keeps that duration.

## Decisions so far

- `CreateBookingInput.preferredTime` is optional. Omitted on an open day stores `preferred_starts_at` null. A closed day is still `SALON_CLOSED`. A present time still uses today’s picker rules.
- Assistant create (intake token that will attach) still requires a time. Phone booking still requires a time and a worker.
- Quarters visible and none selected: muted `Možeš poslati i bez vremena.` A selected quarter hides it. Closed: `Salon je zatvoren taj dan.` and Send off. Open with nothing tappable: `Nema slobodnog termina.` and Send on.
- Pending card and My Bookings show the date and `Bez vremena` when the start is null.
- Assumed: timed pending rows keep `COALESCE(reschedule_starts_at, preferred_starts_at)` then `created_at`. Rows with that clock null follow, oldest `created_at` first.

## Open decisions

## Not yet specified

## Out of scope

- Several times at once
- A counter-proposal on another day
- Assistant sends with no time
- Push, SMS, or email
