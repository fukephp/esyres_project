# Answer key: E2-email-password

> Epic 2 auth shell: public email+password register, no homepage login wall.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E2-email-password.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-email-password |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to create an account with email and password without a homepage login wall, so that I can browse first and sign in when I request or open My Bookings.” |
| Goal (one sentence) | A guest can browse without a login wall, create a customer with email+password (optional phone) via a shared auth shell at send and My Bookings, and send still requires a session plus the existing verify gates. |
| Branch name | `story/E2-email-password` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-30 |

## Pass/fail — product

- [ ] Guest `me` is `null` (not an error). After `register` or `login`, `me` returns that user’s `id`, `email`, and `emailVerified: false` for a fresh register — verify: Behat
- [ ] `register(email, password)` creates the customer, starts a Sanctum session, leaves `email_verified_at` and `phone_verified_at` null, stores `name` from the email local-part, phone null when omitted — verify: Behat
- [ ] Optional phone on register is stored unverified; duplicate phone → `PHONE_TAKEN`; duplicate email → `EMAIL_TAKEN`; password shorter than 8 → `WEAK_PASSWORD`; malformed email → `INVALID_EMAIL` — verify: Behat
- [ ] `register` dispatches the Laravel verify-email notification and does **not** set `email_verified_at` — verify: Behat (`Notification::fake`)
- [ ] After register (session, unverified), `createBooking` returns `EMAIL_UNVERIFIED`. Guest `createBooking` still returns `UNAUTHENTICATED`. Existing verified-customer send still works — verify: Behat
- [ ] `logout` invalidates the session; afterward `me` is `null` — verify: Behat
- [ ] Auth shell (login \| register) at send and logged-out `/bookings`; logged-in `/bookings` stub + logout; “Moji zahtjevi” on `/` and `/salon/:id`; `/` has no login form — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`. ADR 0002 still holds for send gates.

- [ ] Lighthouse `/graphql` only; new fields are `me`, `register`, `logout` — no REST auth, no Fortify/Breeze/Inertia pages — verify: Behat hits `/graphql`; no new web auth routes
- [ ] Sanctum cookies, not Bearer; Behat uses CSRF + session like the SPA; no `actingAs` / magic token — verify: Behat login/register/logout steps
- [ ] Send gates unchanged: session + `email_verified_at` + `phone_verified_at` (architecture 08 items 5–6). Password login allowed while unverified — verify: Behat `EMAIL_UNVERIFIED` after register; existing guest_create_booking scenarios still pass
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require
- [ ] No Redis, OTP mutations, verify-email UI, mailpit, bookings list query, `/owner`, GraphQL codegen, `vite-plugin-pwa`, or Playwright this PR — verify: `esyres_app/docker-compose.yml` still has no redis/mailpit; schema has no bookings list; frontend routes

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

- Email-verify click-link / “I’ve verified” UI (sibling E2)
- Phone OTP mutations, Redis, SMS (sibling E2)
- Full My Bookings list / status tabs (Epic 4)
- Owner routes / invite onboarding
- Password reset
- OTP as alternate login
- Dedicated `/login` `/register` routes
- Salon Booking Assistant (Epic 10)
- QR hold cookie (Epic 8)
- Notifications / Reverb (beyond dispatching verify-email on register)
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Fortify / Breeze / Inertia auth pages
- Nginx, redis, reverb, mailpit in slim Compose
- Native apps, payments, worker logins
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E2-email-password`.
3. **GraphQL:** `me: User` (null guest). `register(email: String!, password: String!, phone: String): User!`. `logout: Boolean!`. Keep existing `login` and `User { id email emailVerified }`. Handwritten operations (no codegen).
4. **Register:** public. Hash via existing password cast. `name` = email local-part. Phone omit/blank → null; else unique unverified. Session regenerate like `login`. Call `sendEmailVerificationNotification()`; do not set `email_verified_at` or `phone_verified_at`. Codes: `EMAIL_TAKEN`, `PHONE_TAKEN`, `WEAK_PASSWORD` (< 8), `INVALID_EMAIL`. Dispatch is queued in the Laravel sense; Behat stays sync + `Notification::fake`. Do not add Redis, mailpit, or a worker service.
5. **Logout:** invalidate Sanctum session. Afterward `me` is null.
6. **Behat:** English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. New feature covering every GraphQL product check above. Existing discovery/profile/booking/owner features must still pass. No Mink.
7. **PWA:** shared auth shell (login | register toggle). Optional phone on register only. Use at: picker on `UNAUTHENTICATED`; `/bookings` when `me` is null. Logged-in `/bookings`: Bosnian stub (“nema zahtjeva”), logout control, **no** bookings query. Sparse “Moji zahtjevi” link on `/` and `/salon/:id`. `/` has no auth form. Map new error codes to Bosnian i18n. Skip Playwright, `/owner`, verify-email UI, OTP UI.
8. Do not add Pest, Fortify, Breeze, or REST auth. Do not weaken `createBooking` gates.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/` (no login wall + Moji zahtjevi), picker auth shell, and `/bookings` (logged-out shell and logged-in stub) in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
