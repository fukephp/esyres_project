# Answer key: STORY-90

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-90 |
| Source | `docs/stories/STORY-90.md` — Request Detail modal |
| Goal (one sentence) | Request Detail is a modal over the board the owner came from, and a pasted link sits on Zahtjevi for that booking’s salon and day. |
| Branch name | `batch/STORY-90-91-92-93-94` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] `/owner/requests/:id` stays the route. The card is a `<dialog className={SALON_PICKER_DIALOG_CLASS}>` (phone sheet / `md+` card). In-card heading is still customer name then that mode’s clock. Form, read, and bounce share that one card. Zatvori (`salon.close`) is in the dialog. There is no `owner.back` and no `from=zapisi` on this page — verify: Vitest `ownerPanel.source.test.ts`
- [ ] Zatvori, backdrop (`event.target === dialog`), and Escape (`onCancel` does not `preventDefault`) call the same close. Close goes to `location.state.board` when that string is set. Otherwise it goes to `ownerQueuePath` for the booking’s salon and `preferred_date` — verify: Vitest `ownerPanel.source.test.ts`
- [ ] Card links and Predloži pass `state={{ board: pathname + search }}`. `requestFromZapisiPath` is only `/owner/requests/:id` plus the zapisi query that already belongs to the list, with no `from=zapisi` — verify: Vitest `owner.test.ts` and `zapisi.source.test.ts`
- [ ] While the dialog is up, the board behind is `OwnerHome` or `OwnerZapisi` with `lockedSearch` and `hideSwitcher`. A zapisi `state.board` renders Zapisi. Any other open, including a paste after the booking loads, renders Zahtjevi. The board wrapper is `inert` — verify: Vitest `ownerPanel.source.test.ts`
- [ ] Accept, decline, and counter-propose call `refetchBooking` and do not `navigate` on success. Phone cancel may still leave. No-show still refetches — verify: Vitest `ownerPanel.source.test.ts`
- [ ] `if (loading)` still returns `OwnerPageSkeleton` + `RequestDetailSkeleton` before `me == null`. Auth and not-owner stay uncarded (`TopNav`, no dialog). Forbidden or missing row renders `NOT_REQUESTED` inside the dialog card — verify: Vitest `skeleton.source.test.ts` and `ownerPanel.source.test.ts`

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` and `docs/mvp/04-UI-Design-Goals.md` (Request Detail card). No new API.

- [ ] No new npm package. No GraphQL or PHP change. No `behat.yml` change — verify: `git diff` for this story has no `esyres_app/app/`, `graphql/`, `features/`, or `package.json` dependency change
- [ ] Classifier: frontend + `.cursor` + `docs/stories` only, so skip Behat — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `master...HEAD` when `main` is absent). Do not skip Behat from a story label.

Expected for this story’s diff: **skip Behat**.

**If skipped** — from `esyres_app/frontend/`:

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Assign-worker taps (STORY-91)
- Day-only copy (STORY-92)
- Accept, propose, or decline rules
- Customer My Bookings
- Telefon close-on-save

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-90.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Stay on `batch/STORY-90-91-92-93-94`.
3. Turn `OwnerRequestDetail` into the dialog over `OwnerHome` / `OwnerZapisi`. Add `lockedSearch` and `hideSwitcher` on those boards and `OwnerShell`. Pass `state.board` from queue, kanban, and Zapisi links. Drop `goQueue` after accept, propose, and decline.
4. Update the Vitest files named above. Set Loop to `STORY-90` on the story file and `docs/stories/index.md`.
5. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice ends this story.
6. On verify exit 0: commit on this branch. Message is the `# STORY-90 — …` line. Do not open a PR.
7. On the cap or a repeated failure: restore the worktree to the last commit on this branch, including untracked files this story added, and leave the id for the batch skill.
