# Story map: STORY-93

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-93 |
| Source | `docs/stories/STORY-93.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-93.md` |

## Destination

Kanban leads with U toku. Two account checkboxes can hide U toku and Završeno i otkazano. Hidden cards stay out of the other columns.

## Notes

- Consult: `docs/stories/STORY-93.md`
- Grill Q2 = option 1. Grill Q3 = option 1.
- Zapisi still has no progress bar (`docs/mvp/03-Key-Features.md`).

## Decisions so far

- Column order: U toku, Zahtjevi, Predloženo, Potvrđeno, Završeno i otkazano. U toku is `confirmed` with `start <= now < end` on the original occupied range (Sarajevo). Potvrđeno is a future start. Završeno is declined, cancelled, and confirmed whose end is at or before now.
- Checkboxes sit on Zahtjevi and Zapisi Kanban only, under the selected-day title and above the columns. Labels `U toku` and `Završeno i otkazano`. Kalendar and Postavke do not get them.
- `User.showInProgress` and `User.showFinished` default true. `updateKanbanColumns(showInProgress, showFinished)` saves immediately. A guest is `UNAUTHENTICATED`. Any signed-in person may set them.
- A failed save keeps the last saved pair and shows `Kolone nisu sačuvane. Pokušaj ponovo.`
- Membership recomputes on the same 60s tick as the progress bar. The bar stays on Zahtjevi confirmed cards in Kalendar, U toku, Potvrđeno, and ended confirmed in Završeno. Pending, proposed, declined, and cancelled have none.

## Open decisions

## Not yet specified

## Out of scope

- Dragging cards
- A now-line
- Hiding Zahtjevi, Predloženo, or Potvrđeno
- Per-salon or per-browser flags
