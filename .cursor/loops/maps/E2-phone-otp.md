# Story map: E2-phone-otp

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-phone-otp |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to verify my phone with OTP before my request is sent (optional earlier, required at submit), so that the salon can SMS me if push fails.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E2-phone-otp.md` |

## Destination

A sessioned customer can complete phone OTP (send code + verify). After that, `createBooking` no longer returns `PHONE_UNVERIFIED` for that user. Email-verify and login gates stay. Real guests stop needing a Behat phone fixture to send.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 2, `docs/architecture/` (03, 04, 05, 06, 07, 08), `docs/glossary.md`, `docs/adr/0001-mysql-in-slim-compose.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `docs/adr/0005-otp-in-laravel-cache.md`, `docs/adr/0006-phone-e164-any-country.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: `createBooking` throws `PHONE_UNVERIFIED` when `phone_verified_at` is null. Register may store optional `phone` (unique, unverified, no format check). `me` exposes `id email emailVerified` only. Picker maps `PHONE_UNVERIFIED` to a one-liner; no OTP panel. Behat fixtures set `phone_verified_at` when OTP is not under test. No `SmsGateway`, no OTP mutations, no Redis service. Slim Compose: php + node + mysql. Behat: `CACHE_STORE=array`, sync queue, `Notification::fake`. Architecture 03: Fake `SmsGateway` stores last code; Behat reads it and calls the same verify mutation; no magic OTP in app code.
- Architecture 06: hashed OTP + throttle in Laravel Cache (Redis when that service lands; ADR 0005); GraphQL errors generic; no CAPTCHA; fake/log `SmsGateway` locally. SMS never sent inline on a mutation (queue; Behat sync).
- Architecture 08 #9 Redis still the target; #18 SMS as interface (vendor not contracted); #28 throttle in cache; #36 slim Compose is php+node+mysql — redis stays off this PR (ADR 0001, 0005).
- Standing preferences:
  - Do not invent a second API (not REST, not Fortify/Breeze)
  - Do not weaken architecture 08 items 5–6 (session + email verified + phone OTP to send)
  - Do not add nginx, worker, mailpit, reverb, or a live SMS vendor this PR
  - Do not ship OTP-as-login, QR reconcile (Epic 8), Epic 10, owner panel, or the E4 bookings list

## Decisions so far

- Send gates stay: session + `email_verified_at` + `phone_verified_at`. This story completes phone OTP; it does not skip email verify.
- Stack stays Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA keeps React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Phone remains optional at register (already shipped). This story owns send-time OTP, not making phone required on register.
- OTP-as-alternate-login is out of this PR (architecture 06 mentions it; prior E2 keys deferred it).
- SMS vendor stays uncontracted. Local/Behat: fake/log `SmsGateway`. Behat reads the last code from the fake, not from the store.
- No magic OTP in application code. Fixtures may still set `phone_verified_at` when OTP is not under test.
- QR hold reconcile at email+phone verification stays Epic 8.
- **OTP store (2026-08-30):** hashed codes + TTL + throttle in Laravel Cache. No Redis service this PR. Behat stays `CACHE_STORE=array` and reads the last code from fake `SmsGateway`. Redis remains the intended cache driver when that service lands. ADR: `docs/adr/0005-otp-in-laravel-cache.md`.
- **GraphQL (2026-08-30):** sessioned `requestPhoneOtp(phone: String!): Boolean!` and `verifyPhoneOtp(code: String!): Boolean!`. Guest → `UNAUTHENTICATED`. Request allowed before email is verified. Phone only on request, code only on verify (pending number is the session user’s row). SPA retries `createBooking` after verify. Not REST, not a signed SMS link, not OTP-as-login.
- **Phone on request (2026-08-30):** always pass `phone`. Normalize (strip spaces/dashes/parens; leading `00` → `+`) and store canonical E.164, any country: `+` plus 8–15 digits, first digit 1–9. Else `INVALID_PHONE`. Write this user’s unverified `phone` immediately, then send OTP; overwrite this user’s own unverified number. Same helper on `register` when phone is non-blank. Another user has that number → `PHONE_TAKEN`. Same user + same number → send/resend. Fixture-only DB rows may stay non-E.164. ADR: `docs/adr/0006-phone-e164-any-country.md`.
- **OTP numbers (2026-08-30):** 6-digit numeric, 5-minute TTL. Send throttle 1/minute per phone and per IP. 5 wrong verifies → 15-minute cooldown. `INVALID_OTP` for wrong/expired/missing (do not distinguish). `TOO_MANY_ATTEMPTS` for send throttle or fail cooldown (do not distinguish). Guest `UNAUTHENTICATED`; bad number `INVALID_PHONE`; taken `PHONE_TAKEN`.
- **UI (2026-08-30):** On `PHONE_UNVERIFIED`, stay on `/salon/:id`. Panel: phone field (prefill `me.phone`), send code, 6-digit field, verify, then retry `createBooking`. `me.phone: String` (null if none) and `me.phoneVerified: Boolean`; same on login/register payloads. `/bookings`: email panel if email unverified; else OTP panel if phone unverified. No new route. Exact Bosnian copy is not a machine check; visual via PR screenshots.
- **Already verified (2026-08-30):** if `phone_verified_at` is set, `requestPhoneOtp` and `verifyPhoneOtp` return `PHONE_ALREADY_VERIFIED`. Do not clear verification or swap the number. Change-of-verified-phone is later.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- OTP as alternate login
- Change of an already-verified phone (re-OTP settings flow)
- QR hold reconcile at verify (Epic 8)
- Live SMS vendor / Infobip / Twilio contract
- nginx, redis, worker, mailpit, reverb in slim Compose
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
