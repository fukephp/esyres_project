# Answer key: STORY-83

> Epic 4: Carbon `HH:mm` labels in Europe/Sarajevo for the three booking clocks. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-83 |
| Source | `docs/stories/STORY-83.md` — Sarajevo clock labels |
| Goal (one sentence) | Preferred, proposed, and reschedule starts arrive as Sarajevo `HH:mm` from Carbon, and Zahtjevi, Request Detail, Zapisi, and My Bookings render those strings. |
| Branch name | `story/STORY-83-sarajevo-clock-labels` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-30 |

## Pass/fail — product

- [ ] `Booking` adds `preferredStartsAtLabel: String!`, `proposedStartsAtLabel: String` (null unless status is `TIME_PROPOSED`), and `rescheduleStartsAtLabel: String` (null when there is no overlay). Each is Carbon `H:i` in `Europe/Sarajevo`. A 15:00 Sarajevo start on 2026-08-31 (CEST) and on 2026-01-15 (CET) both label `15:00`. Existing ISO fields stay (`2026-08-31T13:00:00+00:00` and `2026-01-15T14:00:00+00:00` for those two). `proposedDate: String` is the Sarajevo `Y-m-d` of `proposed_starts_at` when status is `TIME_PROPOSED`, else null. No migration and no new package — verify: Behat on `features/guest/create_booking.feature` (extend the 15:00 read-back scenario, plus a 2026-01-15 twin), `features/owner/propose_time.feature` (label `14:00` and `proposedDate` `2026-08-29`), and `features/guest/reschedule.feature` (label `15:00` with the stored `rescheduleDate`)
- [ ] Zahtjevi Kalendar and Kanban, the pending pile, Request Detail, and Zapisi show the label for the clock they already show (proposed label when the row’s offered start is the proposed instant, otherwise the preferred label; reschedule overlay uses the reschedule label). They do not call `formatSarajevoTime` or `formatSarajevoDateTime` on those instants. Request Detail’s intake time fallback uses `preferredStartsAtLabel` — verify: Vitest `clockLabels.source.test.ts` (new) on `OwnerHome.tsx`, `OwnerBoards.tsx`, `OwnerRequestDetail.tsx`, `OwnerZapisi.tsx`
- [ ] My Bookings row clock is `formatCivilDate` of the stored day plus the matching label: `proposedDate` + `proposedStartsAtLabel` when `TIME_PROPOSED`, otherwise `preferredDate` + `preferredStartsAtLabel`. The reschedule-pending line is `formatCivilDate(rescheduleDate)` + `rescheduleStartsAtLabel`. No `formatSarajevoDateTime` on those clocks — verify: Vitest `clockLabels.source.test.ts` on `MyBookings.tsx`
- [ ] `formatSarajevoTime` / `sarajevoToday` / weekday helpers stay for Telefon overlap math, “today”, and weekday names. Salon hours, breaks, and Telefon pills are unchanged — verify: existing `format.test.ts`, `owner.test.ts`, and `phoneBooking.source.test.ts` green

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (UTC instants, `APP_TIMEZONE=Europe/Sarajevo`, Carbon `HH:mm` labels) and decision 19 in `docs/architecture/08-Decisions.md`.

- [ ] Storage stays UTC via `UtcDatetime`. ISO methods still return `->utc()->toIso8601String()`. Labels call `timezone('Europe/Sarajevo')->format('H:i')` on the cast attribute. `APP_TIMEZONE` default stays `Europe/Sarajevo`. No Composer change — verify: Behat read-back above, and `git diff` has no `composer.json` / `composer.lock` change
- [ ] Classifier fails (PHP + `graphql/` + frontend). Behat runs the full suite. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo's default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP, GraphQL, and frontend).

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

- Quarter starts on Pošalji zahtjev (STORY-84)
- Salon hours, breaks, and Telefon pills
- Replacing ISO fields, or formatting `created_at` and the other timestamps
- A `proposed_date` column

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-83.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-83-sarajevo-clock-labels` from current `master`.
3. On `Booking`, add the three label methods and `proposedDateString()`. Wire them on `type Booking` in `graphql/schema.graphql` next to the ISO fields. Select the new fields in every guest and owner query that renders those clocks.
4. Frontend: a small helper may pick preferred vs proposed label the way `bookingStartIso` picks the instant. Render the string. Do not parse it back through `Intl`.
5. Update source tests that currently require `formatSarajevoTime(booking.preferredStartsAt)` on Request Detail, the diary pile, and Zapisi.
6. Loop: implement → classifier → matching verify. Cap 8. Same failure twice with no progress: stop and open a draft PR.
7. On pass: open a PR whose body links this key and lists the verify commands. Then remind: Bugbot, then human review and merge.
