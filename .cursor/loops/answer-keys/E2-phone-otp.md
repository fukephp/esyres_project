# Answer key: E2-phone-otp

> Epic 2: complete phone OTP so send stops returning `PHONE_UNVERIFIED` for that gate.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E2-phone-otp.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-phone-otp |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to verify my phone with OTP before my request is sent (optional earlier, required at submit), so that the salon can SMS me if push fails.” |
| Goal (one sentence) | A sessioned customer can request and verify a phone OTP so `createBooking` no longer returns `PHONE_UNVERIFIED`; email and login gates stay. |
| Branch name | `story/E2-phone-otp` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-30 |

## Pass/fail — product

- [ ] Guest `requestPhoneOtp` / `verifyPhoneOtp` → `UNAUTHENTICATED` — verify: Behat
- [ ] Session + valid E.164 `requestPhoneOtp`: stores canonical unverified `phone` (normalize spaces/dashes/parens/`00` → `+`; `+` plus 8–15 digits), returns true, fake `SmsGateway` last code is 6 digits; junk → `INVALID_PHONE`; another user’s number → `PHONE_TAKEN`; overwrite this user’s own unverified number — verify: Behat
- [ ] `verifyPhoneOtp` with that last code sets `phone_verified_at`; `me.phoneVerified` is true; `createBooking` succeeds when email is already verified (no phone fixture) — verify: Behat
- [ ] Wrong code → `INVALID_OTP` (`phone_verified_at` stays null). Five wrong verifies then a sixth → `TOO_MANY_ATTEMPTS`. Time-travel past 5-minute TTL then last code → `INVALID_OTP` — verify: Behat
- [ ] Second `requestPhoneOtp` within a minute (same phone or same IP) → `TOO_MANY_ATTEMPTS` — verify: Behat
- [ ] If `phone_verified_at` is set, `requestPhoneOtp` and `verifyPhoneOtp` → `PHONE_ALREADY_VERIFIED`; phone row unchanged — verify: Behat
- [ ] `requestPhoneOtp` succeeds while email is unverified; `createBooking` still `EMAIL_UNVERIFIED` until email is verified, then `PHONE_UNVERIFIED` until OTP completes — verify: Behat
- [ ] `register` with non-blank junk phone → `INVALID_PHONE`; valid E.164 stored unverified (omit/blank still null) — verify: Behat
- [ ] Picker on `PHONE_UNVERIFIED`: stay on `/salon/:id`, phone + send code + 6-digit verify + retry `createBooking`. `/bookings`: email panel if email unverified, else OTP panel if phone unverified — verify: human-only: PR review desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`. ADRs 0002, 0005, 0006.

- [ ] New GraphQL fields are `requestPhoneOtp` and `verifyPhoneOtp` only (Boolean); `User` gains `phone` (nullable) and `phoneVerified`; Lighthouse `/graphql`; handwritten SPA operations; no REST OTP, no Fortify/Breeze — verify: schema + Behat
- [ ] Hashed OTP + throttle in Laravel Cache (6 digits, 5-minute TTL, 1 send/minute per phone and IP, 5-fail / 15-minute cooldown). No Redis service. SMS via queued job + `SmsGateway` (fake stores last code; log locally). No magic OTP in app code. Behat reads the fake, not cache plaintext — verify: Behat; `esyres_app/docker-compose.yml` has no redis
- [ ] Send gates stay session + `email_verified_at` + `phone_verified_at` (architecture 08 items 5–6, ADR 0002). Existing guest booking scenarios still pass; fixtures may still set `phone_verified_at` when OTP is not under test — verify: Behat
- [ ] Phone stored as canonical E.164, any country (ADR 0006). No CAPTCHA. No OTP-as-login. No change of a verified number — verify: Behat `PHONE_ALREADY_VERIFIED`; schema has no login-by-phone
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require
- [ ] No nginx, redis, worker, mailpit, `/owner` product work, bookings list query, GraphQL codegen, `vite-plugin-pwa`, or Playwright this PR — verify: `esyres_app/docker-compose.yml`; schema; frontend routes

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- OTP as alternate login
- Change of an already-verified phone
- Redis / nginx / worker / mailpit / reverb in slim Compose
- Live SMS vendor (Twilio, Infobip, …)
- QR hold reconcile at verify (Epic 8)
- Password reset
- Full My Bookings list / status tabs (Epic 4)
- Owner routes / invite onboarding
- Salon Booking Assistant (Epic 10)
- Notifications / Reverb beyond OTP SMS
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Fortify / Breeze / Inertia auth pages
- Native apps, payments, worker logins
- Public owner registration
- Reward-badge display (Phase 2)

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `docs/adr/0005-otp-in-laravel-cache.md`, `docs/adr/0006-phone-e164-any-country.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E2-phone-otp`.
3. **Phone helper:** normalize (strip spaces/dashes/parens; leading `00` → `+`). Canonical E.164: `+` plus 8–15 digits, first digit 1–9. Else `INVALID_PHONE`. Use on `register` (non-blank) and `requestPhoneOtp`. Unique when present → `PHONE_TAKEN` (other user). Fixture-only DB rows may stay non-E.164.
4. **GraphQL:** `requestPhoneOtp(phone: String!): Boolean!`. `verifyPhoneOtp(code: String!): Boolean!`. Session required. Request allowed before email verify. Phone only on request (write this user’s unverified `phone` immediately, overwrite own unverified). Code only on verify. `User.phone` (nullable String) and `User.phoneVerified`. Handwritten SPA operations. If `phone_verified_at` is set, both mutations → `PHONE_ALREADY_VERIFIED` (do not swap).
5. **OTP store:** Laravel Cache, hashed code, 5-minute TTL. 6-digit numeric. Send throttle 1/minute per phone **and** per IP → `TOO_MANY_ATTEMPTS`. Five failed verifies then 15-minute cooldown → `TOO_MANY_ATTEMPTS`. Wrong/expired/missing → `INVALID_OTP` (do not distinguish). No Redis service. No CAPTCHA.
6. **SMS:** `SmsGateway` interface. Local: log. Behat: fake that stores the last plaintext code (Behat reads that, then calls `verifyPhoneOtp`). Dispatch a queued job from the mutation; do not send inline. Behat already `QUEUE_CONNECTION=sync`. Do not add a worker container or a live vendor.
7. **Behat:** English Gherkin, guest suite. Cover every GraphQL product check above (including time travel for TTL). Existing features must still pass. Fixtures may still set `phone_verified_at` when OTP is not under test. No magic OTP in app code. No Mink.
8. **PWA:** On `PHONE_UNVERIFIED`, stay on `/salon/:id`: phone field (prefill `me.phone`), send code, 6-digit verify, retry `createBooking`. `/bookings`: keep email panel if `me.emailVerified` is false; else OTP panel if `me.phoneVerified` is false. Map new GraphQL codes to Bosnian. No new route. Skip Playwright, `/owner`, OTP-as-login.
9. Do not add Pest, Redis, nginx, mailpit, or a queue worker. Do not weaken `createBooking` gates. Do not set `phone_verified_at` at register or on `requestPhoneOtp`.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. Do not capture or attach screenshots (human-only UI check is merge-gate review).
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
