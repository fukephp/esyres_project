# Answer key: STORY-93

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-93 |
| Source | `docs/stories/STORY-93.md` — U toku column |
| Goal (one sentence) | Kanban shows visits happening now in U toku, and the account can hide that column or the finished one. |
| Branch name | `batch/STORY-90-91-92-93-94` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] `kanbanColumn` returns `inProgress` when confirmed and `start <= now < end` on the original occupied range. Future confirmed is `confirmed`. Declined, cancelled, and confirmed with `end <= now` are `done`. `requested` is `pending`. `time_proposed` is `proposed`. Phone and no-show confirmed rows use the same range — verify: Vitest `owner.test.ts`
- [ ] Zahtjevi and Zapisi Kanban render `inProgress`, `pending`, `proposed`, `confirmed`, `done` in that order, including a column with count 0. Checkboxes `U toku` and `Završeno i otkazano` sit under the day title and above the columns. Unchecked omits that column and does not move its cards. Kalendar has no checkboxes — verify: Vitest `ownerPanel.source.test.ts` and `zapisi.source.test.ts`
- [ ] `users.show_in_progress` and `users.show_finished` are non-null booleans, default true, including existing rows. `updateKanbanColumns` persists both. A guest is `UNAUTHENTICATED`. Any signed-in user may set them — verify: Behat `features/owner/kanban_columns.feature`
- [ ] The 60s tick in `OwnerHome` is the only clock for column membership and the bar. The bar is passed for confirmed cards on Kalendar, U toku, Potvrđeno, and ended confirmed in Završeno. Zapisi still passes no `progress` — verify: Vitest `ownerPanel.source.test.ts`
- [ ] A failed `updateKanbanColumns` leaves the checks on `me.showInProgress` / `me.showFinished` and shows `Kolone nisu sačuvane. Pokušaj ponovo.` — verify: Vitest `ownerPanel.source.test.ts`

## Pass/fail — architecture

Cite `docs/architecture/05-Data-Model.md` (account flags, not per salon). No drag. No now-line.

- [ ] Flags live on `users`, not `salons`. No new npm package — verify: migration and `graphql/schema.graphql`
- [ ] Classifier fails (PHP), so Behat runs — verify: CONTEXT classifier at verify time

## Verify commands

Same classifier and command sets as STORY-90. Expected: **Behat runs.**

## Out of scope

- Dragging cards
- A now-line
- Hiding Zahtjevi, Predloženo, or Potvrđeno
- Per-salon or per-browser flags

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-93.md`.
2. Stay on `batch/STORY-90-91-92-93-94`.
3. Extend `KanbanColumn` with `inProgress`. Split confirmed by the occupied range end, using the same start the progress bar uses (`preferred` clock, not the reschedule overlay). Default both flags true.
4. Checkboxes on both Kanban boards. `KanbanSkeleton` becomes five columns. Update `docs/architecture/05-Data-Model.md` User bullet with the two flags.
5. Behat plus Vitest. Set Loop to `STORY-93` on the story and the index.
6. On verify exit 0: commit. Message is the `# STORY-93 — …` line. Do not open a PR.
7. On the cap or a repeated failure: restore this branch to the last commit, including untracked files this story added.
