# Story map: STORY-91

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-91 |
| Source | `docs/stories/STORY-91.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-91.md` |

## Destination

A no-preference `requested` row that already has a time confirms when the owner taps a free worker. The guest is not asked.

## Notes

- Consult: `docs/stories/STORY-91.md`, `docs/adr/0044-assign-worker-confirms.md`
- Overlap matches `WorkerOverlap` / `acceptPreferredTime`. Hours are not re-checked.

## Decisions so far

- `assignWorker(bookingId, workerId)` sets `confirmed` at `preferred_starts_at` with that worker and stamps `owner_responded_at` once on first success.
- Taps on the Zahtjevi pending card (Kalendar pile and Kanban Zahtjevi) and inside Request Detail. Zapisi cards have none.
- Assumed: taps sit in the action row before Predloži and Odbi, in salon worker id order, canvas pills the same size as Predloži. A tap in the open modal refetches and stays open.
- Nobody free: no taps. Predloži and Odbi stay. Named-worker Prihvati stays the only accept tap.
- Slot taken rejects, does not stamp, and leaves the existing slot-taken error in place.

## Open decisions

## Not yet specified

## Out of scope

- Day-only requests (STORY-92)
- Hours or break checks
- Push, SMS, or email beyond the existing confirmed status push
- Worker logins
- Changing Predloži
