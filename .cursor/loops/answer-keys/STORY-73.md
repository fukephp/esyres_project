# Answer key: STORY-73

> Epic 3: Zahtjevi selected-day list reads as a diary (one clock gutter, hairline occupying rows, Inter day heading).
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-73.md` and `docs/mvp/04-UI-Design-Goals.md` (Zahtjevi card). Row chrome only.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-73 |
| Source | `docs/stories/STORY-73.md` — Zahtjevi diary day list |
| Goal (one sentence) | The Zahtjevi selected-day list uses one left clock gutter and hairline occupying rows so start times scan in one column, without changing order or mutations. |
| Branch name | `story/STORY-73-zahtjevi-diary` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-28 |

## Pass/fail — product

- [x] `/owner` selected-day list keeps STORY-67 order and behavior: month navigator, till-pile (`<details>` when more than two pending), soon heading `owner.soon`, empty `owner.empty`, closed `owner.closedDay`, no-workers `owner.noWorkers`, break `owner.break`, accept / decline / propose / keep-original, occupying tap to `/owner/requests/:id`, subscriptions, no drag. Phone stays stacked; `md+` stays month-left / list-right (`md:grid md:grid-cols-2`). Month title `h2` stays `font-display`. **Telefon** stays — verify: existing Vitest `ownerPanel.source.test.ts` (`owner home is month navigator plus selected-day list`) and `phoneBooking.source.test.ts` still pass
- [x] Day heading `h3` is Bosnian weekday + `formatPickerDayNumeric`, Inter 600 at the current size: `text-lg font-semibold tracking-tight text-ink`. That `h3` has no `font-display`. Page titles and the month `h2` keep `font-display` — verify: Vitest `diaryDayList.source.test.ts` (the `h3` class string; month `h2` still `font-display text-lg`)
- [x] One shared clock column. Pending and occupying rows use the same grid `grid-cols-[3.5rem_minmax(0,1fr)]`. Gutter is `text-sm tabular-nums text-ink`. No second time column. Phone and `md+` use that same row class (no `md:` variant on the row grid) — verify: Vitest `diaryDayList.source.test.ts` (both `QueueRow` and `OccupyingRow` contain that grid class)
- [x] **Pending** card stays `rounded-lg border border-hairline bg-surface-soft`. Gutter is `formatSarajevoTime(queueRowClock(row))` (reschedule start when the overlay is on, otherwise preferred start) and sits outside the card. Meta is duration and worker (or `salon.noPreference`) only — the muted line does not call `formatSarajevoTime`. Initial, `Uskoro` / `Premještaj` / `Asistent`, and `Prihvati` / `Predloži` / `Odbi` (including reschedule `Prihvati` / `Zadrži stari`) stay on the card — verify: Vitest `diaryDayList.source.test.ts` (gutter call before the card; meta slice has `salon.duration` and `salon.noPreference` and no `formatSarajevoTime`; still `queueChipInitial`, `owner.reschedule`, `owner.assistant`, `owner.soon`, `owner.accept`, `owner.propose`, `owner.decline`, `owner.keepOriginal`)
- [x] **Occupying** has no box (`border border-hairline` wrapper and horizontal padding box are gone). The row is a `Link` to `/owner/requests/${id}` with `border-b border-hairline` under gutter and content. Gutter is `block.start`. Meta is `occupyingDiaryMeta` (`–{end}`, plus ` · {worker}` when the name is non-empty; start not repeated). Worker dot, `block.label` (service snapshot names), `Predloženo vrijeme`, and `Nije došao` stay — verify: Vitest `diaryDayList.source.test.ts` plus `owner.test.ts` (`occupyingDiaryMeta('11:00', 30, 'Ana')` is `–11:30 · Ana`; empty name is `–11:30`; en-dash matches `occupyingClockRange`)
- [x] **Pauza** and **Zatvoreno** stay muted lines with no clock gutter and no diary grid. Break copy stays `owner.break` plus `item.endsAt`. Closed copy stays `owner.closedDay`. Soon `h4` stays a heading, not a timed gutter row — verify: Vitest `diaryDayList.source.test.ts` (break `<p` and closed `<p` do not include `grid-cols-[3.5rem_minmax(0,1fr)]`; `owner.soon` heading remains an `h4`)
- [x] No new Bosnian strings. No new GraphQL, PHP, or Behat — verify: Vitest `diaryDayList.source.test.ts` does not require new `i18n` keys; `git diff` of this PR has no files under `esyres_app/graphql/`, `esyres_app/app/`, or `esyres_app/features/`

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (Zahtjevi month navigator + selected-day list), `docs/mvp/04-UI-Design-Goals.md` (Zahtjevi card diary gutter), `docs/adr/0035-zahtjevi-month-and-selected-day-list.md` (order and occupancy unchanged).

- [x] One React PWA. Row chrome only in `OwnerHome.tsx` plus `occupyingDiaryMeta` in `owner.ts`. `occupyingClockRange` stays for Request Detail. No `esyres_app/marketing`. No drag, no staff columns, no now-line — verify: `OwnerRequestDetail.tsx` still calls `occupyingClockRange`; `OwnerHome.tsx` still has no `@dnd-kit` / `WorkerPanel` (existing `ownerPanel.source.test.ts`)
- [x] Classifier: this PR is PWA + the answer key + the story Loop slug. Expected: **skip Behat**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **skip Behat** (no PHP / `features/` / `graphql/` schema edits).

From **git root**:

```text
test ! -d esyres_app/marketing
```

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

- Homepage `/`, OwnerNav, and Request Detail chrome
- Month navigator pixels, including the Cal Sans month title
- A clock gutter on Pauza, Zatvoreno, the soon heading, empty copy, or loading
- Staff-column board, drag, and a new end-time word
- Mutations, occupancy rules, and list order
- Zapisi (STORY-75)
- New i18n keys

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-73.md`, and `docs/mvp/04-UI-Design-Goals.md` (Zahtjevi card). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-73-zahtjevi-diary` from current `master`.
3. Add `occupyingDiaryMeta(start, durationMinutes, workerName?)` next to `occupyingClockRange` in `esyres_app/frontend/src/lib/owner.ts`. End clock uses the same `hhmm(minutes(start) + durationMinutes)` and the same en-dash. With a non-empty worker name: `–{end} · {name}`. Otherwise `–{end}`.
4. `OwnerHome.tsx` only for chrome. Day `h3`: drop `font-display`, keep `text-lg font-semibold tracking-tight text-ink`. Pending `QueueRow`: grid `grid-cols-[3.5rem_minmax(0,1fr)]`; gutter `formatSarajevoTime(queueRowClock(row))`; card unchanged; remove the time segment from the meta line. Occupying `OccupyingRow`: same grid on the `Link`; `border-b border-hairline` (no surrounding box); gutter `block.start`; meta `occupyingDiaryMeta`; keep dot, `block.label`, proposed tag, no-show tag, and the request link. Pauza `<p>`, Zatvoreno `<p>`, soon `h4`, empty, and loading stay outside that grid.
5. Tests: `owner.test.ts` for `occupyingDiaryMeta`. New `esyres_app/frontend/src/lib/diaryDayList.source.test.ts` for the source checks above. Do not weaken `ownerPanel.source.test.ts` or `phoneBooking.source.test.ts`.
6. Set Loop to `STORY-73` on `docs/stories/STORY-73.md` and `docs/stories/index.md`.
7. Loop: implement → classifier → matching verify (expected frontend npm from `esyres_app/frontend/`) → fix. Cap 8. Same failure twice → escalate.
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on the same PR. If Bugbot contradicts this key, stop and ask.
