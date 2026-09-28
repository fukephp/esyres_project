# Answer key: STORY-74

> Epic 3: owner writes a phone booking from Zahtjevi. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-74 |
| Source | `docs/stories/STORY-74.md` — Phone booking |
| Goal (one sentence) | An owner writes a confirmed booking for a caller who is not a customer, from Zahtjevi, and can cancel it before the start. |
| Branch name | `story/STORY-74-phone-booking` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-28 |

## Pass/fail — product

- [ ] Zahtjevi shows a **Telefon** text button on the right of the Cal card, on the row above the month/list split. It is not an OwnerNav item, not a month cell, and not a modal. The link is `/owner/phone` plus the same `salon` query Zahtjevi uses, and `date` only when that day is not today, so **Nazad** can return there. The wizard does not read `date` into its day field — verify: Vitest `phoneBooking.source.test.ts`
- [ ] `/owner/phone` is a lazy route (Suspense fallback `salon.loading`). Owner-ready shell matches Zahtjevi: `TopNav`, aside, `OwnerNav` `active="queue"`, salon switcher when they own more than one salon. Logged-out, unverified email, and not-owner match Zahtjevi’s returns, not the form. Changing salon resets the draft. h1 is **Telefon**. **Nazad** above the card goes to Zahtjevi for that salon and the `date` query (today when absent) and drops the draft — verify: Vitest `phoneBooking.source.test.ts`; add `pages/OwnerPhoneBooking.tsx` to the owner-page lists in `topNav.source.test.ts`, `authPlace.source.test.ts`, `ownerSalons.source.test.ts`, and `designPack.test.ts`
- [ ] Four screens, one at a time, values kept on step **Nazad**. Headings **Usluge**, **Dan i vrijeme**, **Radnik**, **Pozivalac**. Step 1: services under that salon’s category headings, none pre-checked. Step 2: **Datum** and **Vrijeme**, both starting empty (native date and time). Step 3: required worker, only workers free for that range, no “Nema preference”. Step 4: **Ime i prezime**, **Telefon (opcionalno)**, **Bilješka (opcionalno)**. **Dalje** is disabled until the step is valid (at least one service; date and time set; a worker selected). Empty free-worker list shows **Nema slobodnog radnika.** and no **Dalje**. Step 4 submits with **Spremi** — verify: Vitest `phoneBooking.source.test.ts` and `owner.test.ts` (`i18n.t` strings)
- [ ] Blank or whitespace caller name sets **Unesi ime.** and does not send `createPhoneBooking`. A rejected save stays on step 4 with one line under **Spremi** — verify: Vitest `phoneBooking.source.test.ts` (early return before the mutation)
- [ ] Sessioned `createPhoneBooking(input: CreatePhoneBookingInput!): Booking!` for a verified owner of that salon. Guest → `UNAUTHENTICATED`. Unverified email → `EMAIL_UNVERIFIED`. Other salon → `FORBIDDEN`. Input: `salonId`, `serviceIds`, `preferredDate`, `preferredTime`, `workerId` (required), `callerName`, optional `callerPhone`, optional `callerNote`. Born `confirmed`, `customer` null, `origin` `PHONE`, `worker` set, `ownerRespondedAt` null, duration = service sum rounded up to 15 via `Booking::roundUp15`. Service rows are snapshots. Caller name is trimmed and stored; phone is trimmed, empty becomes null, and is not written to `users.phone`; note empty becomes null. A user with the same phone is not attached. `myBookings` for that user does not include the row — verify: Behat `features/owner/phone_booking.feature`
- [ ] Save rejects, and does not insert a row: no services → `INVALID_SERVICES`; blank name → `INVALID_CALLER_NAME`; closed day → `SALON_CLOSED`; range outside that day’s open/close → `OUTSIDE_HOURS`; range inside the break or spanning it → `DURING_BREAK` (not `OUTSIDE_HOURS`); overlap with `confirmed` or `time_proposed` on that worker → `SLOT_TAKEN`; worker missing, from another salon, or not free → `INVALID_WORKER`. A range that ends when the next starts is free (half-open). Earlier today saves. Do not return `PAST_TIME`. No second row for the same taken range — verify: Behat `features/owner/phone_booking.feature`
- [ ] No owner push, no customer push, no SMS, and no reminder mail for this save. `bookings:send-reminders` skips a null customer instead of reading `email_verified_at` on it. `owner_responded_at` stays null — verify: Behat `features/owner/phone_booking.feature` (`no owner push was sent`, `no customer push was sent`, reminder command on a phone row sends nothing)
- [ ] After save the client opens Zahtjevi on the saved day (`ownerQueuePath`), with `salon` when this shop is not the first owned. That day’s occupying list includes the row (service snapshot names and worker). It is not in the pending queue. Busy-level and `SalonWeekStats` bookings count include it like any other confirmed booking — verify: Vitest source (navigate to `ownerQueuePath` with the saved date); Behat occupying query, pending query, and week stats
- [ ] `customerName` for a phone booking is the caller name. Request Detail shows that name, the phone line only when set, the note line only when set, and the saved services, day, time, and worker. The **Raniji termini** block is omitted. No accept, decline, propose, customer cancel, or reschedule controls. `priorConfirmedBookings` is empty — verify: Vitest `phoneBooking.source.test.ts` / `ownerPanel.source.test.ts`; Behat `priorConfirmedBookings` empty and `customerName` equals the caller
- [ ] Before the start, Request Detail offers two-step **Otkaži termin** then **Otkaži**, with **Odustani** to back out, and no reason field. `cancelPhoneBooking(bookingId: ID!): Booking!` sets `cancelled`, sets `cancelled_at`, leaves `late_cancel` false, frees the range, and increments no cancel or late counters. A second owner can not cancel another salon’s row (`FORBIDDEN`). Customer `cancelBooking` and `requestReschedule` do not take this row. After the start, `cancelPhoneBooking` returns `PAST_START` and the button is absent — verify: Behat `features/owner/phone_booking.feature`; Vitest source (two-step copy, no reason field, button only when phone + confirmed + start still ahead)
- [ ] After the start, **Nije došao** still calls `markNoShow`. Status stays `confirmed`. Salon `no_show_count` increments by 1. No user `no_show_count` changes. A second mark does not increment again. The occupying row shows **Nije došao** — verify: Behat `features/owner/phone_booking.feature`
- [ ] Existing rows: `origin` backfill is `assistant` when an intake’s `booking_id` points at the row, otherwise `picker`. Guest `createBooking` without an intake stores `picker`. `createBooking` that attaches an intake stores `assistant`. A null `customer_id` is not treated as phone — verify: Behat `features/owner/phone_booking.feature` (one backfill assertion plus one picker create and one intake create)
- [ ] Bosnian `bs` only for the new strings: **Telefon**, **Dalje**, **Pozivalac**, **Bilješka (opcionalno)**, **Nema slobodnog radnika.**, **Otkaži termin**, **Unesi ime.**, **Termin pada u pauzu.** Reuse **Nazad**, **Spremi**, **Usluge**, **Radnik**, **Datum**, **Vrijeme**, **Ime i prezime**, **Telefon (opcionalno)**, **Otkaži**, **Odustani**, and the existing `SALON_CLOSED` / `OUTSIDE_HOURS` / `SLOT_TAKEN` / `INVALID_WORKER` lines — verify: Vitest `owner.test.ts`

## Pass/fail — architecture

Cite `docs/adr/0038-phone-booking-without-customer.md`, `docs/architecture/05-Data-Model.md` (Booking origin, nullable customer, caller fields), `docs/architecture/04-Frontend.md` (`/owner/phone`), `docs/glossary.md` (Phone booking, Caller, Booking origin, Phone booking cancel).

- [ ] One React PWA + Lighthouse GraphQL. Mutations `App\GraphQL\Mutations\CreatePhoneBooking` and `App\GraphQL\Mutations\CancelPhoneBooking`. No REST route, no worker login, no `esyres_app/marketing`. `customer_id` becomes nullable. New columns `origin`, `caller_name`, `caller_phone`, `caller_note` — verify: diff has that migration and those two resolvers; `App.tsx` has `/owner/phone` and no Zapisi route
- [ ] Do not call `OwnerPush`, `CustomerStatus`, or `Counters::onCancel` from the phone mutations. `markNoShow` on a null customer increments the salon only. `SendBookingReminders` skips a null customer. Reuse `Booking::roundUp15`, `WorkerOverlap::taken`, and `PreferredClock` date/time parsing without its `PAST_TIME` check. Distinguish break from outside hours (do not collapse both into `OpenWindow::contains`) — verify: Behat above; `rg OwnerPush` / `rg CustomerStatus` under the two new mutation files stay empty
- [ ] Classifier: this PR touches PHP, a migration, `graphql/schema.graphql`, and `features/` → **Behat runs**. Do not change `behat.yml`. Flags stay CLI-only — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP + migration + schema + features).

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

- Zapisi (STORY-75), including OwnerNav **Zapisi**
- Zahtjevi diary row chrome (STORY-73)
- Voice recording, a bubble transcript, and an agent that books from audio
- Worker login and receptionist roles
- Owner reschedule
- Empty-cell create on the day list
- Linking the caller to a customer user
- Push, SMS, or email for this booking
- A 15-minute step lock on the time input (`PAST_TIME` stays unused)

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-74.md`, `docs/adr/0038-phone-booking-without-customer.md`, and `docs/glossary.md` (Phone booking, Caller, Booking origin, Phone booking cancel). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-74-phone-booking` from current `master`.
3. Migration: `customer_id` nullable (keep the users FK). `origin` string not null, default `picker`, backfill `assistant` where `assistant_intakes.booking_id` matches, else leave `picker`. `caller_name` nullable string, `caller_phone` nullable string, `caller_note` nullable text. GraphQL enum `BookingOrigin { PICKER ASSISTANT PHONE }` stored lowercase like `BookingStatus`. Expose `origin`, `callerPhone`, `callerNote` on `Booking`. `customerName` returns `caller_name` when `origin` is `phone`.
4. `CreatePhoneBooking`: `OwnerAccess::user` + `OwnerAccess::salon`. Parse `preferredDate` / `preferredTime` in `Europe/Sarajevo` with the same shape checks as `PreferredClock` but do not throw `PAST_TIME`. Closed day → `SALON_CLOSED`. Range outside opens/closes → `OUTSIDE_HOURS`. Range that overlaps the break (`start < breakEnd && breakStart < end`) → `DURING_BREAK`. Then `WorkerOverlap::taken`. Lock the worker’s occupying rows before the overlap check. Snapshot services the same way as `CreateBooking`. Set `status` confirmed, `customer_id` null, `origin` phone, `worker_id` required, no `owner_responded_at`. Do not call `OwnerPush` or `CustomerStatus`.
5. `createBooking`: set `origin` to `picker`, and to `assistant` when an intake is attached. `CancelPhoneBooking`: owner of the salon, `origin` phone, `confirmed`, start still ahead, else `PAST_START`. Set `cancelled`, `cancelled_at` now, `late_cancel` false. Do not call `Counters::onCancel` or `BroadcastCancelled`. `markNoShow`: when `customer_id` is null, increment salon `no_show_count` only; keep the second-mark no-op. `SendBookingReminders`: `continue` when `customer` is null. `priorConfirmedBookings`: empty when `customer_id` is null.
6. Page `OwnerPhoneBooking.tsx` and the Zahtjevi **Telefon** link as in the product checks. Free workers: that salon’s workers minus anyone `WorkerOverlap` would reject for the chosen range, and an empty list when the day is closed, outside hours, or on the break. Wire `CREATE_PHONE_BOOKING_MUTATION`. On success `navigate(ownerQueuePath(savedDate, …))`. Register the lazy route in `App.tsx`.
7. Request Detail: phone lines and two-step cancel as in the product checks. `CANCEL_PHONE_BOOKING_MUTATION`. Omit **Raniji termini** when `origin` is `PHONE`. Keep **Nije došao** after the start.
8. i18n `bs` only, under `owner.phone` except where an existing key already has the sentence. Map the error codes named above.
9. Behat `features/owner/phone_booking.feature` covers the product checks that name it. Reuse existing push, occupying, and counter steps. No new suite.
10. Set Loop to `STORY-74` on `docs/stories/STORY-74.md` and `docs/stories/index.md`.
11. Loop: implement → classifier → matching verify (expected full Behat from `esyres_app/`) → fix. Cap 8. Same failure twice → escalate.
12. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
13. After PR: Bugbot; nits on the same PR. If Bugbot contradicts this key, stop and ask.
