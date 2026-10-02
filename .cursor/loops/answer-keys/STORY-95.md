# Answer key: STORY-95

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-95 |
| Source | `docs/stories/STORY-95.md` — Telefon past start |
| Goal (one sentence) | Telefon refuses a start that is already past, in the modal and on `createPhoneBooking`. |
| Branch name | `story/STORY-95-telefon-past-start` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-02 |

## Pass/fail — product

- [ ] `createPhoneBooking` returns `PAST_TIME` when the Sarajevo start is before now, including a date before today. A start equal to the frozen Behat clock (`2026-08-29 09:00:00` Europe/Sarajevo) still saves. Closed day, outside hours, break, overlap, blank name, and a foreign worker still return their existing codes — verify: Behat `features/owner/phone_booking.feature`
- [ ] Scenarios that today book a start before that frozen clock (the “earlier today” case at 08:30, busy level at 08:00, and any other start before 09:00) move to a start that is not past, except one scenario that expects `PAST_TIME`. The half-open overlap, busy level, cancel-before-start, and no-show cases stay green — verify: Behat `features/owner/phone_booking.feature`
- [ ] On Danas, a past quarter stays listed and disabled. The label is the time only. Zauzet stays the label only when the quarter is booked and not past. A later tap on Danas stays on Danas. Drugi dan’s date input has `min` set to today. Choosing today or tomorrow in that date still selects Danas or Sutra — verify: Vitest `phoneBooking.source.test.ts` and `owner.test.ts`
- [ ] A past quarter is not a legal start, so the first open skips a today with nothing left to tap (`phoneSkipDate`). When Danas or Sutra has in-hours quarters and none are tappable, the past ones stay visible, the line is `Nema slobodnog termina.`, and Dalje stays off — verify: Vitest `owner.test.ts` (`phoneSkipDate`, `phoneLegalStarts` or the past filter it uses) and `phoneBooking.source.test.ts`
- [ ] Past is judged when the day step renders, on Dalje, and on save. No `setInterval`. A past start on render or Dalje clears that start and the worker and stays on the day step. Save of a past start stays on the caller step, the modal stays open, and the error is `To vrijeme je već prošlo.` (`owner.phone.error.PAST_TIME`) — verify: Vitest `phoneBooking.source.test.ts`, `owner.test.ts` (`phoneErrorKey`), and `i18n` assertion
- [ ] Pošalji zahtjev stays as it is, including day-only send and guest past quarters — verify: existing `guestQuarter.test.ts` and Behat `features/guest/create_booking.feature` stay green

## Pass/fail — architecture

Cite `docs/architecture/09-Api-Boundaries.md` (same `ClientError` codes) and `docs/architecture/05-Data-Model.md` (phone booking born confirmed, no customer). Clock is Europe/Sarajevo, same cutoff as `createBooking` (`local < now`).

- [ ] No migration, no new status, no new npm package. Do not change `createBooking`, accept, assign worker, counter-propose, or reschedule. Guest picker files stay untouched — verify: `git diff --name-only master...HEAD` has no `database/migrations` and does not list `CreateBooking.php`, `AcceptPreferredTime.php`, `AssignWorker.php`, `ProposeTime.php`, or `SalonProfile.tsx`
- [ ] Classifier fails (PHP), so Behat runs. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (`CreatePhoneBooking.php` and `features/owner/phone_booking.feature`).

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- A ticking clock
- Guest picker and `createBooking`
- Accept, assign worker, counter-propose, and reschedule
- Rows already saved
- The assistant

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-95.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch `story/STORY-95-telefon-past-start` from `master`.
3. Reject a past start in `CreatePhoneBooking` with `PAST_TIME`, same cutoff as `createBooking`. Reuse `quarterStartPast` for the modal. Drugi dan date `min` is today. A past quarter is not a legal start for the existing 7-day skip.
4. Behat’s clock is `2026-08-29 09:00:00` Europe/Sarajevo. Replace the “earlier today is allowed” scenario with `PAST_TIME`. Move any other phone start that is before that clock so the rest of `phone_booking.feature` still passes.
5. Set Loop to `STORY-95` on the story and the index.
6. On verify exit 0: open a ready PR whose body links this key and lists what was verified. Do not embed screenshots. Message the commit with the `# STORY-95 — …` line.
7. On the cap or a repeated failure: open a draft PR with the failing check and the last command output. Do not keep spending cycles.
