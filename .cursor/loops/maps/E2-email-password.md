# Story map: E2-email-password

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-email-password |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to create an account with email and password without a homepage login wall, so that I can browse first and sign in when I request or open My Bookings.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E2-email-password.md` (after compile) |

## Destination

Guest browse stays open. A customer can create an email+password account (auth shell: login \| register) at send and at My Bookings — not on `/`. `createBooking` still requires a session; guests can register instead of only logging into a seeded user.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 2, `docs/architecture/` (03, 04, 06, 08), `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: `login` + picker login-on-`UNAUTHENTICATED`. No `register`, `me`, `logout`. `/` is guest discovery (no auth form). No `/bookings`. `createBooking` gates: session + `email_verified_at` + `phone_verified_at` (ADR 0002). Slim Compose: php + node + mysql; no Redis, no mailpit. Verify: Behat + frontend typecheck/test/build + marketing build from `esyres_app/`.
- User paste: “auth shell; send gates need an account”
- Standing preferences:
  - Do not invent a second API (not REST, not Fortify/Inertia pages)
  - Do not weaken architecture 08 items 5–6 (email verify + phone OTP still required to send)
  - Do not ship Epic 10, owner panel, or the E4 bookings list
  - Invite-only: no public “Register salon”

## Decisions so far

- Guest `/` stays without a login wall (`docs/mvp/04-UI-Design-Goals.md`, architecture 04). Auth appears at request submit / My Bookings / owner — owner is out of this PR.
- Login stays email+password (Sanctum cookie). Phone is not the username (architecture 08 #4). Password login allowed while email unverified (architecture 06).
- Customer register is public. No public salon registration (architecture 08 #7).
- Send gates stay: session + `email_verified_at` + `phone_verified_at`. This story adds the account, not OTP UI or verify-email UI (ADR 0002 siblings).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA keeps React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- **Surfaces (2026-08-30):** one shared auth shell (login | register toggle) at send (picker, on `UNAUTHENTICATED`) and on `/bookings` when logged out. Logged-in `/bookings` is a Bosnian stub — no bookings query (E4). No dedicated `/login` `/register`. `/` stays guest-only. No `/owner`. Domain: **Customer** (not a separate “account” type); **My Bookings** is the `/bookings` surface.
- **`me` (2026-08-30):** `me: User` — null for a guest, not an error. `/bookings` branches on it. Picker still opens the shell on `UNAUTHENTICATED` at send; no auth chrome before they try.
- **Register (2026-08-30):** public `register(email: String!, password: String!, phone: String): User!`. Phone optional — omit/empty stores null; if present, unique, `phone_verified_at` stays null. Duplicate phone → `PHONE_TAKEN`. Duplicate email → `EMAIL_TAKEN`. Weak password → `WEAK_PASSWORD` (< 8). Bad email → `INVALID_EMAIL`. Auto-session like `login`. Both verify timestamps null. No Fortify/Inertia. `users.name` from email local-part; no name input. Shell: optional phone on the register toggle only, not on login.
- **Verify mail (2026-08-30):** `register` dispatches Laravel’s verify-email notification (queued; Behat sync + log/fake). Does not set `email_verified_at`. No click-link UI, no mailpit in slim Compose. Sibling E2-verify-email owns completing verification.
- **Logout (2026-08-30):** `logout` mutation invalidates the Sanctum session. Shown only on logged-in `/bookings`. After logout, `me` is null and that page shows the auth shell. Not on `/` or the salon profile.
- **Reach My Bookings (2026-08-30):** sparse text link “Moji zahtjevi” on `/` and `/salon/:id`. Not a nav bar, not a login wall.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Email-verify UI / click-link flow (sibling E2)
- Phone OTP mutations, Redis, SMS (sibling E2)
- Full My Bookings list / status tabs (Epic 4)
- Owner routes / invite onboarding
- Password reset
- OTP as alternate login
- Homepage login wall
- Salon Booking Assistant (Epic 10)
- QR hold cookie (Epic 8)
- Notifications / Reverb
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Fortify / Breeze / Inertia auth pages
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins
- Public owner registration
