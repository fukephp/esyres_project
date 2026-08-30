# Story map: E2-email-verify

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-email-verify |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to verify my email before my request is sent, so that the salon can reach me with reminders.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E2-email-verify.md` (after compile) |

## Destination

A customer who registered can complete email verification. After that, `createBooking` no longer returns `EMAIL_UNVERIFIED` for that user (phone OTP gate stays). Register already dispatches verify-mail; this story owns finishing the verify.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 2, `docs/architecture/` (03, 04, 06, 08), `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `docs/adr/0003-email-verify-signed-get.md`, `docs/adr/0004-email-verify-get-no-session.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: `register` creates a session, calls `sendEmailVerificationNotification()`, leaves `email_verified_at` null. Custom queued `App\Notifications\VerifyEmail` (Laravel signed-URL mail). `createBooking` and owner mutations already throw `EMAIL_UNVERIFIED`. Picker maps that to Bosnian copy only — no check-email, resend, or retry. No `verification.verify` route. Slim Compose: php + node + mysql; `MAIL_MAILER=log`; no mailpit, no nginx, no Redis, no queue worker. `QUEUE_CONNECTION` defaults to `database`. Verify: Behat + frontend typecheck/test/build + marketing build from `esyres_app/`.
- Architecture 06: verification mail on register; password login allowed while unverified; booking mutations and `/owner` require `email_verified_at`. Architecture 08 #6 and #8: email verified before request; Lighthouse one endpoint.
- Standing preferences:
  - Do not invent a second API (not REST, not Fortify/Breeze/Inertia pages)
  - Do not weaken architecture 08 items 5–6 (phone OTP still required to send)
  - Do not add mailpit / redis / nginx / queue worker to slim Compose this PR
  - Do not ship phone OTP UI, Epic 10, owner panel, or the E4 bookings list

## Decisions so far

- Send gates stay: session + `email_verified_at` + `phone_verified_at`. This story completes email verify; it does not skip or fixture the phone gate away in product code (Behat may still fixture phone when OTP is not under test).
- Stack stays Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA keeps React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Register already owns dispatch of verify-mail; this story must not set `email_verified_at` at register.
- **Complete via signed GET (2026-08-30):** Laravel `verification.verify` handler for the URL `App\Notifications\VerifyEmail` already builds. Behat GETs that signed URL from the faked notification, then GraphQL `me` / `createBooking`. Not a GraphQL `verifyEmail`, not REST auth, not Fortify. ADR: `docs/adr/0003-email-verify-signed-get.md`. Architecture 08 #8 notes this exception.
- **GET session (2026-08-30):** Valid signed hash is enough. No auto-login. Same user or no session → set `email_verified_at`. Different user session → reject. Already-verified + valid hash → same success path (idempotent). ADR: `docs/adr/0004-email-verify-get-no-session.md`.
- **Landing (2026-08-30):** Success 302 to SPA `/bookings?verified=1`. Session → stub + Bosnian “email potvrđen”; no session → auth shell + same banner. No Laravel welcome, no `/verify-email` route, no return-to-picker (signed URL has no salon id). Absolute URL from `FRONTEND_URL`, fallback `APP_URL`. Behat asserts `email_verified_at` / GraphQL, not the SPA redirect.
- **Picker on `EMAIL_UNVERIFIED` (2026-08-30):** Stay on `/salon/:id`. Replace the one-liner with Bosnian check-email copy plus a retry that calls `createBooking` again (same pattern as after login). Still unverified → stay on this copy. No new route. Exact wording is not a machine check; visual via PR screenshots.
- **Resend (2026-08-30):** GraphQL `resendVerificationEmail: Boolean!`. Session required (`UNAUTHENTICATED`). Already verified → `EMAIL_ALREADY_VERIFIED`. Throttle via cache (1/minute, no Redis) → `TOO_MANY_ATTEMPTS`. Same `VerifyEmail` notification as register. Show on picker check-email state and on `/bookings` when `me.emailVerified` is false. Behat: `Notification::fake` + sync queue (already in Behat env).
- **GET failures (2026-08-30):** Never Laravel 403 Blade. Always 302 to `/bookings`. Tampered or expired signature → `?verify=invalid` (do not tell expired vs forged). Different-user session → `?verify=mismatch`. Behat asserts `Location` and that `email_verified_at` stayed null.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Phone OTP mutations, Redis, SMS (sibling E2)
- Mailpit, nginx, redis, queue worker in slim Compose
- QR hold reconcile at verify (Epic 8)
- Password reset
- OTP as alternate login
- Full My Bookings list / status tabs (Epic 4)
- Owner routes / invite onboarding
- Salon Booking Assistant (Epic 10)
- Notifications / Reverb beyond the existing verify-mail notification
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Fortify / Breeze / Inertia auth pages
- Native apps, payments, worker logins
- Public owner registration
