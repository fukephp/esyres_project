# Story map: STORY-103

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-103 |
| Source | `docs/stories/STORY-103.md` — Suggested salons |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-103.md` |

## Destination

`/my-profile` shows up to three Predloženi saloni when a listed salon shares a migrate-only chip with any booking this customer owns. The row is hidden when nothing qualifies.

## Decisions so far

- Q: each row is the full discovery row: name, today’s busy, that salon’s service category names, and address when set
- Up to 3, name A–Z. Skip favorites and live bookings (`requested`, `time_proposed`, `confirmed`)
- Owner-typed names do not match. Not on `/salons` or `/`

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- A recommendation model, matching owner category names, showing an empty row
