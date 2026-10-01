# Answer key: STORY-86

> Epic 2: a second live booking of the same service on the same Sarajevo day is refused. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-86 |
| Source | `docs/stories/STORY-86.md` — Same-day service block |
| Goal (one sentence) | createBooking, askOtherTime, and requestReschedule refuse when any chosen service is already on a different live booking of that customer at that salon on that preferred day, and the open overlay shows Već imaš ovu uslugu tog dana. |
| Branch name | `story/STORY-86-same-day-service` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] `createBooking` throws `SAME_DAY_SERVICE` and writes no booking when any selected service is already on a **different** live booking of this customer at this salon whose `preferred_date` is that preferred day. Live is `requested`, `time_proposed`, or `confirmed`. Declined, cancelled, and `origin=phone` do not count. A different day, a different salon, a different service, or a different customer still creates `requested`. Worker and clock do not matter. A `requested` row still does not make a quarter Zauzet — verify: Behat `features/guest/same_day_service.feature` (new); existing `quarter_starts.feature` still passes in the full suite
- [ ] The whole send fails if any selected service hits. Nothing is saved, including when an intake token is present (no booking, intake not attached). Chat `createBooking` uses the same reject — verify: Behat `same_day_service.feature`
- [ ] A later rename of the service still blocks a new send of that service. New `booking_services` rows store nullable `service_id`. Match is `service_id` equal to the chosen service, or snapshot `name` equal to that service’s current name. A snapshot name that equals no current service name, and whose `service_id` is null or not the chosen id, does not block. Existing rows with no `service_id` still block when the saved name equals a current service name — verify: Behat `same_day_service.feature`
- [ ] `askOtherTime` and `requestReschedule` throw `SAME_DAY_SERVICE` and leave the row unchanged when the **target** day already has any of that row’s services on a different live booking (same match). The same booking may move to a day that is free of that service, including another time on its current day. An in-progress reschedule overlay does not count as a live booking on the overlay date; the other row counts on its `preferred_date` only — verify: Behat `same_day_service.feature`
- [ ] `createPhoneBooking` is unchanged — verify: existing phone-booking scenarios still pass in the full Behat suite
- [ ] Picker and chat show **Već imaš ovu uslugu tog dana.** and do not enter the sent state. Moje rezervacije shows that same line on ask-other-time and on reschedule. The string names no service — verify: Vitest `sameDayService.test.ts` (new) plus `booking.test.ts` (`respondErrorKey` / `rescheduleErrorKey` return `SAME_DAY_SERVICE`; i18n value is that sentence on `salon.gate`, `bookings.respondError`, and `bookings.rescheduleError`)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (`requested` does not occupy), `docs/architecture/05-Data-Model.md` (booking service snapshot), `docs/architecture/09-Api-Boundaries.md` (mutation loads, domain class writes), `docs/glossary.md` (Same-day service).

- [ ] The reject lives in one domain class under `App\Booking` (same style as `WorkerOverlap`). `CreateBooking`, `AskOtherTime`, and `RequestReschedule` call it inside the write transaction before any column change. `ClientError` code is `SAME_DAY_SERVICE`. Day compare uses stored `preferred_date` (already the Sarajevo calendar date), not the UTC instant. Nullable `service_id` on `booking_services`, `nullOnDelete`. No new package. Do not change `behat.yml` — verify: Behat above, and `git diff` has no `composer.json` / `composer.lock` / `behat.yml` change
- [ ] Note the `service_id` column in `docs/architecture/05-Data-Model.md` (snapshot name stays; id is how a rename still matches). No new public GraphQL field — verify: diff of that doc plus schema has no guest-facing field for this rule
- [ ] Classifier fails (PHP, migration, frontend). Behat runs the full suite — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo's default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP, migration, and frontend).

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

- Disabling the service in the picker or chat before send
- Naming the blocked service in the copy
- Blocking a second customer, a phone booking, or a declined or cancelled row
- Changing Zauzet, occupancy, or the quarter list
- Owner counter-propose and Telefon
- STORY-87, STORY-88, STORY-89

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-86.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-86-same-day-service` from current `master`. Leave unrelated dirty docs (STORY-89 and its ADR edits) off this branch.
3. Add nullable `booking_services.service_id`. `CreateBooking` sets it from the chosen service and still snapshots name, duration, and price. Domain class throws `SAME_DAY_SERVICE` before insert or before ask/reschedule column writes. Exclude the booking being moved. Do not treat another row’s `reschedule_date` as its day.
4. Map `SAME_DAY_SERVICE` in `gateMessage`, `respondErrorKey`, and `rescheduleErrorKey` to **Već imaš ovu uslugu tog dana.** Picker and chat already stay open on a non-gate error via `setError`; do not set `sent`. Do not add a service name to the string.
5. Loop: implement → classifier → matching verify. Cap 8. Same failure twice with no progress: stop and open a draft PR.
6. On pass: open a PR whose body links this key and lists the verify commands. Then remind: Bugbot, then human review and merge.
