# Answer key: STORY-33

> Epic 6: customer reminder email the day before and an hour before a confirmed booking (Sarajevo clock).
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-33.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-33 |
| Source | `docs/stories/STORY-33.md` — Reminder email |
| Goal (one sentence) | A confirmed booking with a verified customer email gets one day-before and one hour-before reminder mail from a scheduled scan (`preferred_starts_at`, stamps, accept-reschedule clears stamps). |
| Branch name | `cursor/story-33-reminder-email-11eb` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

Behat now starts at `2026-08-29 09:00` Europe/Sarajevo. Command is `bookings:send-reminders`. Notification class `BookingReminder` (`kind` `day` \| `hour`). Customer of the booking is the only recipient.

- [ ] Confirmed booking start `2026-08-30 14:00` Sarajevo; command at `2026-08-29 09:00` → one `kind=day` to that customer; subject `Podsjetnik: {salon} sutra`; mail line `Imate termin u {salon} 30. 8. 2026. u 14:00.`; `reminder_day_sent_at` set; no `hour` — verify: Behat
- [ ] Same booking, command again at 09:00 → still one `day`, zero `hour`; stamp unchanged — verify: Behat
- [ ] Same booking, command at `2026-08-30 13:00` → one `kind=hour`; subject `Podsjetnik: {salon} za sat vremena`; same body line as above; `reminder_hour_sent_at` set; still one `day` — verify: Behat
- [ ] Command again at 13:00 → still one `hour` — verify: Behat
- [ ] Confirmed start `2026-08-29 11:00`; command at 09:00 (already D) → no `day`; command at 10:00 → one `hour` only — verify: Behat
- [ ] Confirmed start `2026-08-29 09:30`; command at 09:00 (inside `[T−60, T)`) → no `day`; one `hour` — verify: Behat
- [ ] Confirmed start `2026-08-29 08:00`; command at 09:00 (`now >= start`) → no reminder — verify: Behat
- [ ] `requested` / `time_proposed` / `declined` / `cancelled` in the day-before window → no reminder; confirmed row is independent of a second cancelled row — verify: Behat
- [ ] Confirmed in the day-before window but customer `email_verified_at` is null → no reminder; stamps stay null — verify: Behat
- [ ] `acceptPreferredTime` / `confirmProposedTime` / `cancelBooking` do not send `BookingReminder` until the command runs — verify: Behat
- [ ] Overlay on a confirmed row (original `2026-08-30 14:00`, overlay `2026-09-05 14:00`); command at `2026-08-29 09:00` → `day` body uses **30. 8. 2026. u 14:00** (occupied clock), not the overlay — verify: Behat
- [ ] After that `day` send, `acceptReschedule` → both stamps null; command at `2026-09-04 09:00` → new `day` with body `5. 9. 2026. u 14:00.` — verify: Behat
- [ ] After a `day` send, `dismissReschedule` → stamps stay set; command again → no second `day` — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/02-System-Context.md`, `03-Backend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #6 #19 #26 #36, `docs/adr/0017-reminder-scan-not-delayed-jobs.md`.

- [ ] `bookings.reminder_day_sent_at` / `reminder_hour_sent_at` nullable datetimes. Artisan `bookings:send-reminders`. `bootstrap/app.php` `withSchedule` → that command `everyMinute()`. Queued `BookingReminder` mail notification (`ShouldQueue`); send via `$customer->notify(...)` from the command, never from a mutation. `acceptReschedule` clears both stamps after rewriting `preferred_starts_at`. No new GraphQL field. No delayed-on-confirm jobs — verify: migration + command + `AcceptReschedule`; schema.graphql unchanged for reminders
- [ ] No worker / redis / nginx / mailpit / scheduler container. Behat stays `QUEUE_CONNECTION=sync` + `Notification::fake()`. `MAIL_MAILER=array` in `.env.behat` — verify: `esyres_app/docker-compose.yml` still php+vite+mysql+reverb only
- [ ] No Pest, no Playwright, no GraphQL codegen, no PWA chrome, no i18n keys for this mail (copy lives on the notification) — verify: no `pestphp` require; frontend package.json; no reminder strings under `esyres_app/frontend/`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- SMS reminders
- Marketing / re-engagement email
- Unverified-email reminders
- Customer web push / SMS for status changes (STORY-32)
- Owner push (STORY-31 already shipped)
- Auto-expire command
- Worker / redis / nginx / mailpit / scheduler container
- Reminder settings UI / opt-out
- Customer UI copy that promises a reminder
- Address or `/bookings` link in the mail
- Playwright, Pest, GraphQL codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-33.md`, `docs/glossary.md` (**Reminder**), `docs/adr/0017-reminder-scan-not-delayed-jobs.md`, and `docs/architecture/` (02, 03, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. No PWA UI this story.
2. Stay on branch `cursor/story-33-reminder-email-11eb`.
3. **Schema:** nullable `reminder_day_sent_at` / `reminder_hour_sent_at` on `bookings`. Cast datetimes. Add to `Fillable`. Do not expose them on GraphQL `Booking`.
4. **Notification:** `App\Notifications\BookingReminder implements ShouldQueue`: constructor `(Booking $booking, string $kind)` where `$kind` is `day` or `hour`. `via` = `mail`. Subject `Podsjetnik: {salon->name} sutra` or `… za sat vremena`. One text line: `Imate termin u {salon} {j. n. Y.} u {H:i}.` using `preferred_starts_at` in `Europe/Sarajevo` (example `30. 8. 2026. u 14:00.`). No markdown marketing, no address, no URL. Do not reuse `VerifyEmail`.
5. **Command:** `bookings:send-reminders`. Load `confirmed` bookings with `customer` + `salon`. Skip if customer `email_verified_at` is null. `start` = `preferred_starts_at`. `now` = `now()` (app tz Sarajevo).
   - Day: stamp null AND Sarajevo calendar date of `now` === Sarajevo date of `start` minus 1 day AND Sarajevo clock of `now` >= 09:00 → notify `day`, set `reminder_day_sent_at` = `now`.
   - Hour: stamp null AND `now >= start - 60 minutes` AND `now < start` → notify `hour`, set `reminder_hour_sent_at` = `now`.
   - Both may run in one invocation if both match. `now >= start` → neither. Do not send to the owner. Do not inspect overlay columns.
6. **Schedule:** `Application::configure(...)->withSchedule(fn (Schedule $schedule) => $schedule->command('bookings:send-reminders')->everyMinute())`. Do not add a scheduler/worker service. Do not put Behat flags in `behat.yml`.
7. **Accept reschedule:** after copying overlay into `preferred_starts_at` / `preferred_date` and clearing overlay, set both reminder stamps to null. Dismiss: do not touch stamps. Cancel / decline / ask-other-time: no reminder send (status gate on the scan).
8. **Behat:** English Gherkin. Shared step `When I send booking reminders` → `Artisan::call('bookings:send-reminders')`. Time step `When the current time is "{Y-m-d H:i}" in Sarajevo`. `features/guest/reminder_email.feature` covers send windows, copy, unverified, non-confirmed, mutations do not send. `features/owner/reminder_email.feature` covers overlay clock, accept clears stamps, dismiss keeps stamps. Reset is existing `Notification::fake()` per scenario. Assert `Notification::assertSentTo($customer, BookingReminder::class, ...)`. Keep existing features green.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. Ready = machine gates. Do not embed screenshots.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
