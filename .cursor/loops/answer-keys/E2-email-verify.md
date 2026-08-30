# Answer key: E2-email-verify

> Epic 2: complete email verification so send stops returning `EMAIL_UNVERIFIED` for that gate.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E2-email-verify.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-email-verify |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to verify my email before my request is sent, so that the salon can reach me with reminders.” |
| Goal (one sentence) | A registered customer can complete email verification via the signed mail link (and resend if needed) so `createBooking` no longer returns `EMAIL_UNVERIFIED`; phone OTP gate stays. |
| Branch name | `story/E2-email-verify` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-30 |

## Pass/fail — product

- [ ] GET of the signed verify URL (from the faked `VerifyEmail` notification) with no session sets `email_verified_at`, does **not** create a session (`me` still null), and 302s to `/bookings?verified=1` — verify: Behat
- [ ] Same GET with a session for that user also sets `email_verified_at` and 302s to `/bookings?verified=1`; already-verified + valid hash is the same success path — verify: Behat
- [ ] After verify, `me.emailVerified` is true; `createBooking` returns `PHONE_UNVERIFIED` (not `EMAIL_UNVERIFIED`) until phone is verified; with phone fixture, send succeeds — verify: Behat
- [ ] Tampered or expired signature 302s to `/bookings?verify=invalid`; `email_verified_at` stays null — verify: Behat (`Location`)
- [ ] Signed URL while a **different** user is logged in 302s to `/bookings?verify=mismatch`; target user’s `email_verified_at` stays null — verify: Behat (`Location`)
- [ ] `resendVerificationEmail` (session) dispatches `VerifyEmail` again; guest → `UNAUTHENTICATED`; already verified → `EMAIL_ALREADY_VERIFIED`; second call within a minute → `TOO_MANY_ATTEMPTS` — verify: Behat (`Notification::fake`)
- [ ] Picker on `EMAIL_UNVERIFIED`: check-email copy + resend + retry `createBooking` on `/salon/:id`. `/bookings?verified=1` banner; `/bookings?verify=invalid` and `?verify=mismatch` copy; resend on `/bookings` when `me.emailVerified` is false — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`. ADRs 0002, 0003, 0004.

- [ ] Email verify completes via named route `verification.verify` (signed GET), not a GraphQL `verifyEmail` and not Fortify/Breeze — verify: Behat hits that GET; schema has no `verifyEmail`; no Fortify/Breeze packages
- [ ] GET does not auto-login; send gates stay session + `email_verified_at` + `phone_verified_at` (architecture 08 items 5–6, ADR 0002) — verify: Behat guest `me` after no-session GET; existing guest booking scenarios still pass
- [ ] New GraphQL field is `resendVerificationEmail` only; Lighthouse `/graphql` for product API; SPA still handwritten operations — verify: schema + Behat
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require
- [ ] No Redis, mailpit, nginx, queue worker, OTP mutations, `/owner`, bookings list query, GraphQL codegen, `vite-plugin-pwa`, or Playwright this PR — verify: `esyres_app/docker-compose.yml`; schema; frontend routes

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). MySQL must be up. Every command must exit 0.

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Phone OTP mutations, Redis, SMS (sibling E2)
- Mailpit, nginx, redis, queue worker in slim Compose
- QR hold reconcile at verify (Epic 8)
- Password reset
- OTP as alternate login
- Full My Bookings list / status tabs (Epic 4)
- Owner routes / invite onboarding / owner verify prompt
- Dedicated `/verify-email` SPA route
- Auto-login from the mail link
- Salon Booking Assistant (Epic 10)
- Notifications / Reverb beyond `VerifyEmail`
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Fortify / Breeze / Inertia auth pages
- Native apps, payments, worker logins
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `docs/adr/0003-email-verify-signed-get.md`, `docs/adr/0004-email-verify-get-no-session.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E2-email-verify`.
3. **Signed GET:** named route `verification.verify` matching Laravel’s `VerifyEmail` URL (`/email/verify/{id}/{hash}`). Middleware: `signed` only — **no** `auth`. Valid hash (id + sha1 email): `markEmailAsVerified()`. Do not `Auth::login`. Different session user → 302 `FRONTEND_URL` (fallback `APP_URL`) + `/bookings?verify=mismatch`. Invalid/expired signature → 302 `.../bookings?verify=invalid`. Success (including already verified) → 302 `.../bookings?verified=1`. No Blade 403. Add `FRONTEND_URL` to `.env.example` (local Vite origin). Do not add Fortify/Breeze.
4. **GraphQL:** `resendVerificationEmail: Boolean!`. Session required. Already verified → `EMAIL_ALREADY_VERIFIED`. Cache throttle 1/minute per user → `TOO_MANY_ATTEMPTS`. Same `sendEmailVerificationNotification()`. Handwritten SPA operation. No `verifyEmail` mutation.
5. **Behat:** English Gherkin, guest suite. Pull the signed URL from the faked `VerifyEmail` (`toMail` action URL). HTTP GET (do not follow the SPA redirect); assert `Location` query and DB/`me`/`createBooking`. Cover every product check above. Existing features must still pass. No Mink. Behat env already fakes notifications and uses sync queue + array cache.
6. **PWA:** On `EMAIL_UNVERIFIED`, stay on `/salon/:id`: Bosnian check-email copy, resend, retry `createBooking`. `/bookings`: banner for `verified=1` / `verify=invalid` / `verify=mismatch`; resend when `me.emailVerified` is false. Map new GraphQL codes to Bosnian. No new route. Skip Playwright, `/owner`, OTP UI.
7. Do not add Pest, mailpit, Redis, nginx, or a queue worker. Do not weaken `createBooking` gates. Do not set `email_verified_at` at register.
8. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
9. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of picker check-email+resend+retry, `/bookings?verified=1`, and `/bookings` unverified+resend (not committed). If capture/attach fails, open a **draft/blocked** PR.
10. On escalate: draft/blocked PR with failing checks and the human decision needed.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
