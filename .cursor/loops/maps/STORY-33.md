# Story map: STORY-33

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-33 |
| Source | `docs/stories/STORY-33.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-33.md` |

## Destination

A confirmed booking emails the customer once the day before and once an hour before the appointment (Europe/Sarajevo). Unverified email, SMS reminders, and marketing mail stay out. Push/SMS stay for status changes.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 06, 07), `docs/architecture/` (02, 03, 05, 06, 08 #6 #18 #19 #26 #36), `docs/adr/0018-reminder-scan-not-delayed-jobs.md`, `docs/stories/STORY-33.md` plus STORY-11 / 14 / 29 / 30 / 31 / 32, `docs/glossary.md` (**Confirmed booking**, **Reminder**, **Accept reschedule**, **Cancel**, **Ping** ≠ this notify)
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`): no reminder job, no scheduler (`routes/console.php` is inspire-only; `bootstrap/app.php` has no `withSchedule`). Mail exists only as queued `VerifyEmail` notification. Behat: `Notification::fake()`, `MAIL_MAILER=array`, `QUEUE_CONNECTION=sync`, `Carbon::setTestNow('2026-08-29 09:00:00', 'Europe/Sarajevo')`. Confirm writes `preferred_starts_at` (`acceptPreferredTime` keeps it; `confirmProposedTime` copies `proposed_starts_at`; `acceptReschedule` copies overlay then clears it). Cancel → `cancelled`. Overlay does not move `preferred_starts_at` until accept. Slim Compose has no worker / redis / mailpit / scheduler process. Sync queue **ignores job delay**, so delayed-on-confirm jobs would fire at confirm in Behat.
- Standing preferences:
  - Queue the send; never inline on a mutation
  - Do not add worker / redis / nginx / mailpit / scheduler container this PR
  - Do not ship SMS reminders, marketing mail, or unverified-email reminders
  - Do not ship customer push/SMS status (STORY-32) or owner push (STORY-31 already shipped)
  - Behat GraphQL-over-HTTP + artisan command; no Playwright, Pest, codegen
  - No customer UI chrome for “you will get a reminder” (story AC is send, not a screen)

## Decisions so far

- STORY-33 is **customer reminder email** only. Channel is email; push/SMS stay for status changes (STORY-31 / STORY-32).
- Two sends per confirmed booking: day-before and hour-before, Sarajevo clock (`APP_TIMEZONE=Europe/Sarajevo`).
- Reminder requires a verified email. Confirm is already gated; unverified-email reminders are out of scope.
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat + Vitest/typecheck/build. Bosnian-first copy in the mail. No new GraphQL field. No `/bookings` reminder chrome.
- Mail already faked in Behat (`Notification::fake` + `MAIL_MAILER=array`). Reuse that, do not require Mailpit this PR.
- **Fire (2026-09-10):** scheduled artisan `bookings:send-reminders` scans confirmed rows. Register `everyMinute` in Laravel’s scheduler. Behat calls the command with frozen time. No delayed-on-confirm jobs (`docs/adr/0018-reminder-scan-not-delayed-jobs.md`). Notification is queued (`ShouldQueue`) like `VerifyEmail`; Behat sync + fake records the send.
- **Appointment clock (2026-09-10):** `preferred_starts_at` (Sarajevo date of that instant is D). Overlay does not change reminders until accept-reschedule. Dismiss reschedule: no stamp/clock change. Cancelled / not `confirmed`: no send. Each confirmed row is independent. Customer email only; owner does not get a reminder.
- **Day-before (2026-09-10):** first successful send on calendar D−1 at or after 09:00 Europe/Sarajevo (rest of that Sarajevo day stays eligible until stamped). Not T−24h. Not midnight.
- **Hour-before (2026-09-10):** `now >= start − 60min` and `now < start`.
- **Missed windows (2026-09-10):** no catch-up after the window has **closed**. In-window still sends (confirm on D−1 at 10:00 → day-before; confirm 30 min before start → skip day-before if already D, **do** send hour-before because `[T−60, T)` is still open). If calendar is already D, skip day-before. If `now >= start`, skip hour-before (and day-before).
- **Idempotency (2026-09-10):** `reminder_day_sent_at` / `reminder_hour_sent_at` on `bookings`. Second command run is a no-op for that kind.
- **Verified column (2026-09-10):** send only if customer `email_verified_at` is not null. Local skip-gates that confirm with a null timestamp get no mail.
- **Copy (2026-09-10):** queued mail notification, two variants. Day-before subject `Podsjetnik: {salon} sutra`; hour-before `Podsjetnik: {salon} za sat vremena`. Body: `Imate termin u {salon} {j. n. Y.} u {H:i}.` (Sarajevo). No address, no `/bookings` link, no marketing.
- **Accept reschedule (2026-09-10):** clear both stamps. New clock can get day-before and/or hour-before if those windows are still ahead.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- SMS reminders
- Marketing / re-engagement email
- Unverified-email reminders
- Customer web push / SMS for status changes (STORY-32)
- Owner push (STORY-31)
- Auto-expire command (architecture placeholder; not this story)
- Worker / redis / nginx / mailpit / scheduler container
- Playwright, Pest, GraphQL codegen
- Reminder settings UI / opt-out
- Customer UI copy that promises a reminder
