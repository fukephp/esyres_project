# Answer key: STORY-84

> Epic 2: Pošalji zahtjev lists quarter starts and shows Zauzet. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-84 |
| Source | `docs/stories/STORY-84.md` — Guest quarter starts |
| Goal (one sentence) | The picker has no typed time: after a service is chosen it lists that day’s fitting quarter starts, marks occupying ones Zauzet, and picker `createBooking` rejects a start that list would disable. |
| Branch name | `story/STORY-84-guest-quarter-starts` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-30 |

## Pass/fail — product

- [ ] Public `quarterStarts(salonId, date, serviceIds, workerId): [{ time, booked }]` needs no login. `time` is `HH:mm`. `booked` is true only for Zauzet. Payload has no customer names and no booking rows. Unknown salon, closed day, or a worker id that is not on that salon returns `[]` — verify: Behat `features/guest/quarter_starts.feature` (new), guest query with no login
- [ ] A listed start is a `:00` `:15` `:30` `:45` whose range fits that day’s open hours, does not run through the break, and does not end after close. Range is the selected services’ durations summed, then `Booking::roundUp15`. Half-open overlap, same as `WorkerOverlap`: a start that begins when another range ends is free. A start that fits the unrounded sum and not the rounded sum is omitted — verify: Behat `quarter_starts.feature`
- [ ] Named `workerId`: `booked` when that worker’s `confirmed` preferred range or `time_proposed` proposed range overlaps. No `workerId`: `booked` only when every worker is blocked for the whole range. No workers: every listed start is `booked: false`. A `requested` row does not set `booked`. A `time_proposed` row occupies the proposed clock and proposed worker, not the original preferred clock — verify: Behat `quarter_starts.feature`
- [ ] Picker `createBooking` (no in-flight intake) rejects a start the list would disable: `PAST_TIME`, off-quarter `INVALID_TIME_STEP`, `OUTSIDE_HOURS` (including past close), `DURING_BREAK`, `SLOT_TAKEN` for that occupying overlap. Two picker creates on the same free quarter both stay `REQUESTED`. A second `requested` row does not cause `SLOT_TAKEN`. The old “inside a break is accepted” (`13:30`) and “outside hours is accepted” (`21:00`) scenarios in `create_booking.feature` become those rejects. The busy-level scenario’s 300-minute `10:00` runs through the break; move it to a legal start (`14:00`) so it still creates `requested` — verify: Behat `features/guest/create_booking.feature`
- [ ] A `createBooking` that attaches an in-flight intake keeps today’s checks: it still accepts a break time, an outside-hours time, an off-quarter time, and a clock that overlaps a `confirmed` row. Past, closed weekday, and malformed clocks stay rejected — verify: Behat `features/guest/assistant_intake.feature`
- [ ] Picker dialog has no `type="time"`. After at least one service, fitting quarters render as wrap pills (Telefon free/selected classes: hairline outline, selected `bg-ink` / `text-canvas`, `aria-pressed`). A Zauzet pill shows the time and the word `Zauzet`, is disabled, and is not tappable. A past pill (Sarajevo start instant strictly before now, today only) shows the time only, disabled, with no `Zauzet`. Closed day shows `Salon je zatvoren taj dan.` and no pills. An open day whose pills are all disabled, or whose list is empty, shows `Nema slobodnog termina.` and still shows disabled pills when the list is non-empty. Send stays off unless a tappable pill is selected. Changing services, worker, or date clears a selected start that the new list does not still offer as tappable. While the query is in flight, the picker does not use a skeleton and does not keep the previous date’s pills tappable. Chat `AssistantIntake` still has `type="time"` and does not render this list — verify: Vitest `guestQuarter.test.ts` (new) and updated `salonProfile.source.test.ts`

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (overlap: `confirmed` and `time_proposed` occupy `[start, start + duration)`; `requested` does not), `docs/architecture/04-Frontend.md` (picker quarter starts, chat must not name live quarters), and `docs/adr/0041-guest-quarter-starts.md`.

- [ ] Do not reuse `occupyingBookings` for the guest. Empty staff must not copy `phoneQuarterChoices` (that helper marks every start booked when `workers` is empty). Reschedule overlay does not occupy. Storage stays UTC. No new package. Do not change `behat.yml` — verify: Behat above, and `git diff` has no `composer.json` / `composer.lock` / `behat.yml` change
- [ ] Classifier fails (PHP, `graphql/`, and frontend). Behat runs the full suite — verify: CONTEXT classifier at verify time

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

- Chat quarter list, or tightening chat `createBooking` beyond today’s checks
- My Bookings ask-another-time and reschedule (stay typed)
- Owner counter-propose and Telefon Drugi dan (stay typed)
- An owner screen to edit the quarter catalog
- Holding a chair when the guest sends
- Carbon display labels (STORY-83)
- Danas, Sutra, and Drugi dan on the picker

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-84.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-84-guest-quarter-starts` from current `master`.
3. Add `quarterStarts` on `Query` and a `QuarterStart` type. Resolver uses salon hours plus `WorkerOverlap` / the same break and close predicates as `CreatePhoneBooking`. `booked` is not “past”.
4. In `CreateBooking`, run the new rejects only when no in-flight intake will attach. Map `SLOT_TAKEN`, `OUTSIDE_HOURS`, and `DURING_BREAK` on `salon.gate` with the existing Bosnian lines (`Taj termin je zauzet.`, `Van radnog vremena.`, `Termin pada u pauzu.`). Map `INVALID_TIME_STEP` to the existing `Neispravan datum ili vrijeme.` Guest pills use a salon string `Zauzet`, not `owner.phone.booked`. Empty-day copy is `Nema slobodnog termina.` Closed copy is the existing `Salon je zatvoren taj dan.`
5. Picker pills replace the time input under `Vrijeme`, only after at least one service. Classes match Telefon’s free, selected, and disabled pills. Zauzet text is visible on the booked pill. No `PillsSkeleton` in the picker dialog.
6. Loop: implement → classifier → matching verify. Cap 8. Same failure twice with no progress: stop and open a draft PR.
7. On pass: open a PR whose body links this key and lists the verify commands. Then remind: Bugbot, then human review and merge.
