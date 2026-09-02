# STORY-10 — Email and password

| Field | Value |
|-------|--------|
| ID | STORY-10 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | `E2-email-password` |
| Depends on | STORY-08 |

## User story

As a customer, I want to create an account with email and password without a homepage login wall, so that I can browse first and sign in when I request or open My Bookings.

## Acceptance criteria

- Guest `me` is null (not an error). After register or login, `me` returns that user’s id, email, and emailVerified false for a fresh register.
- Register creates the customer, starts a Sanctum session, leaves email and phone unverified; optional phone stored unverified; duplicate email/phone and weak password rejected.
- Register dispatches the verify-email notification and does not set email verified.
- After register (session, unverified), create-booking returns email unverified. Guest create-booking still unauthenticated. Existing verified-customer send still works.
- Logout invalidates the session; afterward `me` is null.
- Auth shell (login | register) at send and logged-out `/bookings`; logged-in `/bookings` stub + logout; `/` has no login form.

## Out of scope

- Email-verify UI (STORY-11)
- Phone OTP UI (STORY-12)
- Full My Bookings list (STORY-18)
- `/owner`
- Public salon registration
- Fortify / Breeze / REST auth
