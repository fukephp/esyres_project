# Story map: STORY-99

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-99 |
| Source | `docs/stories/STORY-99.md` — Customer card system |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-99.md` |

## Destination

`/`, `/salons`, `/salon/:id`, and `/bookings` use the customer card pack. Owner routes and `/create-salon` stay Design 2. AuthShell is unchanged.

## Notes

- Consult: `DESIGN.md`, `docs/adr/0049-customer-card-pack.md`, `.cursor/CONTEXT.md`
- Frontend-only if no PHP changes

## Decisions so far

- Tokens from the story: canvas `#E8EEF3`, card `#FFFFFF`, ink `#14181F`, muted `#5C6770`, line `#E3E7EB`, blue `#2F6FED` unused on these pages, black pill, radius 20px, shadow `0 8px 30px rgba(20,24,31,0.06)`, Inter
- Homepage sections stay; chrome only. Odjava stays the red pill
- assumed: the shared top-nav on those four routes takes the card canvas and ink; the owner overlay bar stays Design 2

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- `/my-profile`, favorites, suggestions, ratings, owner shell, AuthShell redesign
