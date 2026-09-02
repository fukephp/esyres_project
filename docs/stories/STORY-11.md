# STORY-11 — Email verify

| Field | Value |
|-------|--------|
| ID | STORY-11 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | `E2-email-verify` |
| Depends on | STORY-10 |

## User story

As a customer, I want to verify my email before my request is sent, so that the salon can reach me with reminders.

## Acceptance criteria

- GET of the signed verify URL with no session sets email verified, does not create a session, and redirects to `/bookings?verified=1`.
- Same GET with a session for that user also verifies; already-verified + valid hash is the same success path.
- After verify, create-booking returns phone unverified until phone is verified; with phone already verified, send succeeds.
- Tampered or expired signature redirects to `/bookings?verify=invalid`; email stays unverified.
- Signed URL while a different user is logged in redirects to `/bookings?verify=mismatch`.
- Sessioned resend re-sends the mail; guest unauthenticated; already verified rejected; throttle on rapid resend.
- Picker on email unverified: check-email copy + resend + retry send on the salon profile.

## Out of scope

- Phone OTP (STORY-12)
- QR hold reconcile at verify (STORY-34)
- Password reset
- OTP as alternate login
- Auto-login from the mail link
- Dedicated `/verify-email` SPA route
