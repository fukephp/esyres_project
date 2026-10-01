# Answer key: STORY-87

> Epic 3: Zahtjevi gets one pending-count button that jumps `?date=` through pending days. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-87 |
| Source | `docs/stories/STORY-87.md` — Pending jump |
| Goal (one sentence) | On Zahtjevi only, both Prikaz, a header button **Na čekanju · {n}** (hidden at 0) jumps `?date=` through this salon’s pending days, earliest first, then wraps, and the week of that day follows. |
| Branch name | `story/STORY-87-pending-jump` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] Owner query `pendingJump(salonId)` returns `{ count, dates }` for this salon only. A row counts when it is the same row the pending pile already uses: `requested` on `preferred_date`, or `confirmed` with `reschedule_starts_at` set on `reschedule_date`. `count` is those rows (two on one day count as 2). `dates` is the distinct calendar days of those rows, ascending `YYYY-MM-DD`, past days included. `time_proposed`, declined, cancelled, confirmed with no overlay, and another salon’s rows are absent. A non-owner gets the existing owner-access error — verify: Behat `features/owner/pending_jump.feature` (new)
- [ ] Zahtjevi, both Prikaz, phone and laptop, shows one button in the existing header action row, before Telefon. Label is **Na čekanju · {n}** with that count. `n` is `pendingJump.count`, not the selected day’s pile length and not capped by the pile’s limit of 50. Count `0`, or the jump query not yet returned for this salon, hides the button. Zapisi and Request Detail do not render it. Telefon stays the black pill and still opens the modal — verify: Vitest `pendingJump.source.test.ts` (new) plus `owner.test.ts` (i18n value `Na čekanju · {{count}}` on a new key; do not reuse `owner.pendingFor`)
- [ ] Click writes `?date=` through the existing owner date writer (salon param stays). Stops are `dates`. If the selected day is not a stop, land on the earliest. If it is a stop, land on the next stop, then wrap to the earliest. Several rows on one day are one stop. The week grid and Kanban week chips already follow `?date=`, so the week that contains the landed day follows. Accept, decline, and counter-propose are unchanged — verify: Vitest `owner.test.ts` (`nextPendingDay`) plus `pendingJump.source.test.ts` (click uses `ownerSearchParams` / the existing date writer; QueueRow accept / decline / dismiss markup unchanged)
- [ ] The count refreshes with the queue: the same refetch path that reloads `pendingBookings` also reloads `pendingJump` (subscriptions and accept / decline / dismiss) — verify: Vitest `pendingJump.source.test.ts`

## Pass/fail — architecture

Cite `docs/architecture/09-Api-Boundaries.md` (a list the directives cannot express stays a query class; no domain write), `docs/architecture/03-Backend.md` (`requested` does not occupy; overlay is not a new booking).

- [ ] `pendingJump` is `App\GraphQL\Queries\PendingJump`. It authorizes with the same owner salon check as `PendingBookings`. It does not page and does not return booking rows. No mutation, no migration, no new package. Do not change `behat.yml` — verify: Behat above, and `git diff` has no `composer.json` / `composer.lock` / `behat.yml` / migration
- [ ] No new public guest field. Zapisi and Request Detail queries stay date-scoped as they are — verify: schema diff adds only the owner `pendingJump` field and its payload type
- [ ] Classifier fails (PHP and frontend). Behat runs the full suite — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo's default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP and frontend).

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- A date on the button
- A new accept, decline, or counter-propose control
- The button on Zapisi or Request Detail
- Showing the button when the count is 0
- Changing the selected-day pending pile, its limit of 50, or its heading
- A pending count on the week columns

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-87.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-87-pending-jump` from current `master`. Leave unrelated dirty work off this branch.
3. Query: same row predicate as `PendingBookings`, no date argument, no limit. `count` is the row count. `dates` are distinct `preferred_date` (requested) or `reschedule_date` (overlay), sorted ascending.
4. UI: one button in the Zahtjevi `action` slot, before Telefon, on the shared header row (not inside the Kalendar / Kanban branch, not hidden on one breakpoint). Same height as Telefon (`h-11 rounded-full`). Fill is `bg-pastel-pink` so Telefon stays the only black pill. Label `Na čekanju · {n}`. Hide when count is 0 or this salon’s jump payload is not in yet. Click calls `nextPendingDay(selected, dates)` and the existing `setParams(ownerSearchParams(...))`. Refetch the jump query wherever the queue refetches.
5. `nextPendingDay(selected, dates)`: empty dates → `null`. Selected not in `dates` → `dates[0]`. Selected at index `i` → `dates[i + 1]` or `dates[0]`.
6. Loop: implement → classifier → matching verify. Cap 8. Same failure twice with no progress: stop and open a draft PR.
7. On pass: open a PR whose body links this key and lists the verify commands. Then remind: Bugbot, then human review and merge.
