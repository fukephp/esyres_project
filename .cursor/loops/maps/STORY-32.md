# Story map: STORY-32

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-32 |
| Source | `docs/stories/STORY-32.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-32.md` |

## Destination

A customer is notified of time-critical booking status changes (time proposed / confirmed / declined). Web push is attempted first. If that push does not reach the device, SMS goes to the verified phone. Unverified phone gets no SMS. SMS stays an interface; no marketing SMS; no owner SMS.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 06, 07), `docs/architecture/` (02, 03, 04, 05, 06, 08 #5 #18 #23 #36), `docs/adr/0017-customer-sms-fallback-on-push-miss.md`, `docs/stories/STORY-32.md` plus STORY-12 / 19 / 31 / 33, `docs/glossary.md` (**SMS fallback**, **Time-critical status change**; **Ping** ≠ this notify)
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`): `subscribePush` + `PushSubscription` + `SendOwnerPush` / `PushGateway` (STORY-31, owner events only). Customer never dispatched. `useOwnerPush` only on `/owner*`. SW `notificationclick` uses `payload.url`, default `/owner`. `SmsGateway::send($phone, $code)` is OTP-only (`SendPhoneOtp`). Fake SMS stores last phone+code. Fake push stores last payload; send is void and always “succeeds.” `hasVerifiedPhone()` is true when `APP_ENV=local` even if `phone_verified_at` is null. No expire job. Slim Compose has no worker; Behat `QUEUE_CONNECTION=sync` + fakes.
- Standing preferences:
  - Queue the send; never inline on the mutation (Behat stays sync)
  - Do not add redis / nginx / mailpit / worker this PR
  - Do not ship owner SMS or reminder email (STORY-33)
  - Do not change OTP send (STORY-12)
  - Do not treat assistant **Ping** as this notify
  - Playwright / Pest / codegen still not this PR unless a check cannot name another verifier

## Decisions so far

- STORY-32 is **customer** time-critical notify: web push first, SMS if push misses. Owner push already shipped (STORY-31). Owner SMS is not MVP.
- Named statuses: time proposed / confirmed / declined (`docs/stories/STORY-32.md`, `docs/mvp/03`).
- Unverified phone does not get SMS. Send/respond already required OTP.
- SMS vendor stays an interface (architecture 08 #18). No marketing SMS. Local: log/fake; Behat fake.
- VAPID, not OneSignal (08 #23). `subscribePush` already exists for any Sanctum session; STORY-31 sends only to the salon owner.
- Sends are queued jobs, never inline. Behat: sync queue + fake SMS + fake push (architecture 03). No worker container this PR.
- Reminder email is STORY-33. OTP SMS is STORY-12. Viber / WhatsApp are Phase 2.
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, Vitest/typecheck/build. Bosnian-first. Design 2 customer surface (`/bookings`).
- **Event set (2026-09-10):** owner `proposeTime` (`time_proposed`), `acceptPreferredTime` (`confirmed`), `declineBooking` (`declined`). Not customer confirm/reject/ask-other-time, not cancel, not reschedule overlay / `acceptReschedule`, not expire, not `createBooking`.
- **Push miss (2026-09-10):** no customer `PushSubscription` rows **or** every gateway send fails → SMS. At least one successful send → no SMS. No timed wait, no iOS UA sniff. ADR 0017.
- **Subscribe + click (2026-09-10):** silent `requestPermission` on `/bookings` when sessioned/ready (same pattern as `useOwnerPush`). Denied/unsupported: silent. Click URL `/bookings`. No settings page. SW already opens `payload.url`.
- **SMS phone gate (2026-09-10):** require `phone` set and `phone_verified_at` not null. Do not use `hasVerifiedPhone()`. Missing/unverified: push may still fire; no SMS.
- **Gateway shape (from miss):** `PushGateway::send` reports success/failure (bool or equivalent). Fake defaults to success; a scenario can fail the next send. Status SMS is a separate gateway method from OTP `send($phone, $code)` so Behat OTP tests keep `lastCode`. Fake records last status phone + body.
- **Copy (2026-09-10):** push title = event, body = salon name. `time_proposed` `Predloženo vrijeme`; `confirmed` `Potvrđeno`; `declined` `Odbijeno`. SMS one line `{title}. {salon}.` Decline reason is not on SMS.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Owner SMS
- Reminder email (STORY-33)
- OTP send (STORY-12)
- Viber / WhatsApp (Phase 2)
- Marketing / re-engagement SMS
- Owner push events / chrome (STORY-31)
- In-app queue live-update (STORY-20)
- Settings page / install-wall / “uključi obavijesti” chrome
- Customer notify for cancel, reschedule, expire, or the customer’s own respond
- Real SMS/push vendor, worker container, redis, nginx, mailpit
- Playwright, Pest, GraphQL codegen
