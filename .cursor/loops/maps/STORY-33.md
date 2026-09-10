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
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-33.md` (after compile) |

## Destination

A confirmed booking emails the customer once the day before and once an hour before the appointment (Europe/Sarajevo). Unverified email, SMS reminders, and marketing mail stay out. Push/SMS stay for status changes.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 06, 07), `docs/architecture/` (02, 03, 05, 06, 08 #6 #18 #19 #26 #36), `docs/stories/STORY-33.md` plus STORY-11 / 14 / 29 / 30 / 31 / 32, `docs/glossary.md` (**Confirmed booking**, **Accept reschedule**, **Cancel**, **Ping** ≠ this notify)
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`): no reminder job, no scheduler (`routes/console.php` is inspire-only; `bootstrap/app.php` has no `withSchedule`). Mail exists only as queued `VerifyEmail` notification. Behat: `Notification::fake()`, `MAIL_MAILER=array`, `QUEUE_CONNECTION=sync`, `Carbon::setTestNow('2026-08-29 09:00:00', 'Europe/Sarajevo')`. Confirm writes `preferred_starts_at` (`acceptPreferredTime` keeps it; `confirmProposedTime` copies `proposed_starts_at`; `acceptReschedule` copies overlay then clears it). Cancel → `cancelled`. Overlay does not move `preferred_starts_at` until accept. Slim Compose has no worker / redis / mailpit / scheduler process. Sync queue **ignores job delay**, so delayed-on-confirm jobs would fire at confirm in Behat.
- Standing preferences:
  - Queue the send; never inline on a mutation
  - Do not add worker / redis / nginx / mailpit / scheduler container this PR
  - Do not ship SMS reminders, marketing mail, or unverified-email reminders
  - Do not ship customer push/SMS status (STORY-32) or owner push (STORY-31 already shipped)
  - Behat GraphQL-over-HTTP + artisan command; no Playwright, Pest, codegen
  - No customer UI chrome for “you will get a reminder” unless a later round locks it (story AC is send, not a screen)

## Decisions so far

- STORY-33 is **customer reminder email** only. Channel is email; push/SMS stay for status changes (STORY-31 / STORY-32).
- Two sends per confirmed booking: day-before and hour-before, Sarajevo clock (`APP_TIMEZONE=Europe/Sarajevo`).
- Reminder requires a verified email. Confirm is already gated; unverified-email reminders are out of scope.
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat + Vitest/typecheck/build. Bosnian-first copy in the mail. No new GraphQL field required by the story.
- Mail already faked in Behat (`Notification::fake` + `MAIL_MAILER=array`). Reuse that, do not require Mailpit this PR.

## Open decisions

- How to fire the two sends (scheduled artisan scan vs delayed jobs on confirm) given sync queue ignores delay.
- Exact “day before” clock (09:00 Sarajevo on calendar D−1 vs T−24h vs first run on D−1).
- Missed windows: skip catch-up if confirm (or command) is already past that window / past start.
- Idempotency stamps so a second command run does not double-send.
- Send only when `email_verified_at` is set (local skip-gates can confirm with a null timestamp).
- Mail copy: subject/body fields (salon, Sarajevo date+time, address?) and day vs hour wording.

## Not yet specified

- What happens to reminders after **accept reschedule** if a stamp was already set for the old time (depends on appointment clock + idempotency).
- In-progress reschedule overlay: keep reminding the original occupied clock until accept (likely, once the clock is locked).

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
