# STORY-93 — U toku column

| Field | Value |
|-------|--------|
| ID | STORY-93 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | STORY-93 |
| Depends on | STORY-80, STORY-85 |

## User story

As an owner, I want visits that are happening now in a first Kanban column, and checkboxes to hide that column or the finished one, so that the board stays the pipeline I need.

## Acceptance criteria

- Zahtjevi Kanban and Zapisi Kanban use this column order: **U toku**, **Zahtjevi**, **Predloženo**, **Potvrđeno**, **Završeno i otkazano**. Heads still show a count. Phone columns still scroll horizontally with snap, U toku first.
- **U toku** is `confirmed` whose occupied range contains now on the Sarajevo clock (`start <= now < end`). Phone bookings and no-shows are included. An in-progress reschedule uses the original occupied range.
- **Potvrđeno** is `confirmed` whose start is still in the future. **Završeno i otkazano** is `declined`, `cancelled`, and `confirmed` whose end is at or before now. A visible column with no cards still renders, count 0.
- While the board is open, column membership recomputes once a minute, on the same tick as the progress bar. The bar stays on confirmed cards in Kalendar, on **U toku**, on **Potvrđeno** (empty before the start), and on an ended confirmed card in **Završeno i otkazano**. Pending, time-proposed, declined, and cancelled cards have none.
- Two checkboxes on the Kanban board, not on Postavke, labeled `U toku` and `Završeno i otkazano`. Checked shows that column. Unchecked hides it. Hidden cards are not moved into another column. Kalendar is unchanged.
- The two flags live on the person account, default both visible, shared by Zahtjevi and Zapisi on every device. `User.showInProgress` and `User.showFinished` are non-null booleans. `updateKanbanColumns(showInProgress, showFinished)` saves immediately. A guest is `UNAUTHENTICATED`. Any signed-in person may set them.

STORY-93 supersedes the STORY-80 rule that a confirmed visit moves to **Završeno i otkazano** as soon as the start is past. That file stays as history.

## Out of scope

- Dragging cards
- A now-line on the week grid
- Hiding **Zahtjevi**, **Predloženo**, or **Potvrđeno**
- Per-salon or per-browser flags
