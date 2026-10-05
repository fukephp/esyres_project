# Answer key: STORY-109

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-109 |
| Source | `docs/stories/STORY-109.md` — Unanswered request |
| Goal (one sentence) | A request the owner never answered leaves the live boards at the end of its preferred day and shows as Nije odgovoreno, so it cannot be approved and the miss stays visible. |
| Branch name | `batch/STORY-109-110` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | chat / 2026-10-05 |

## Pass/fail — product

- [ ] `bookings:expire-unanswered` sets a `requested` row whose preferred day is before today in Europe/Sarajevo to `declined` with reason `expired` and leaves `owner_responded_at` empty; a same-day request, a `time_proposed` row, a confirmed row, and a phone booking stay — verify: Behat `features/owner/unanswered_request.feature`
- [ ] Accept, assign, decline, and counter-propose on an ended request throw `EXPIRED`, do not write, and do not set `owner_responded_at` — verify: Behat `features/owner/unanswered_request.feature`
- [ ] Accept still succeeds on the preferred day after the guest quarter has passed — verify: Behat `features/owner/unanswered_request.feature`
- [ ] `pendingJump` still counts a same-day request and a past reschedule overlay, and it does not count or stop on a day whose only row has aged out — verify: Behat `features/owner/unanswered_request.feature` and the updated distinct-days scenario in `features/owner/pending_jump.feature`
- [ ] `unansweredBookings` for that preferred day returns the aged row before and after the command, timed soonest first, then day-only oldest `created_at` first, and sends no customer push — verify: Behat `features/owner/unanswered_request.feature`
- [ ] A still-`requested` past day and a `declined` reason `expired` are unanswered; today still `requested` is **Ističe danas**; a later day is neither; sort is timed soonest then day-only oldest — verify: vitest `owner.test.ts`
- [ ] Kanban puts that row in `done`; Request Detail mode is `expired` (not bounce) and `form` while it is still today; guest grouping drops it from Na čekanju into the newest declined slot; the status key is `UNANSWERED` and reason `expired` is not a sentence — verify: vitest `owner.test.ts` and `booking.test.ts`
- [ ] Owner copy is **Ističe danas** and **Nije odgovoreno**; guest status `UNANSWERED` is **Nije odgovoreno**; `DECLINED` stays **Odbijeno** — verify: vitest `owner.test.ts` / `booking.test.ts`

## Pass/fail — architecture

- [ ] Expire stays `declined` plus reason `expired`. No fifth status (`docs/adr/0010-owner-decline-from-requested.md`, `docs/adr/0050-unanswered-request-ends-with-the-day.md`)
- [ ] Clock is Europe/Sarajevo (`docs/architecture/05-Data-Model.md`)
- [ ] GraphQL plus the existing scheduler command. No new API style (`docs/architecture/03-Backend.md`)

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `master...HEAD`). Skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`.

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

- Aging out `time_proposed`
- In-progress reschedule and phone bookings
- Push, SMS, or email
- Stamping `owner_responded_at`
- A new booking status
- Week-grid cards

## Implementer instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Implement only what this key requires.
3. Loop: implement → CONTEXT frontend-only classifier → matching verify → fix. One cycle is one full verify.
4. Stop when the named checks and verify commands pass, or at cap 8, or when the same failure repeats twice.
5. On success: commit on `batch/STORY-109-110`. Message names `STORY-109` and the story title. Do not open a PR.
6. On the cap or a repeated failure: return the worktree to the last commit on this branch, including untracked files this story added, record STORY-109 as left out, and start STORY-110.
