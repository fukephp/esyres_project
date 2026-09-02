# STORY-12 — Phone OTP

| Field | Value |
|-------|--------|
| ID | STORY-12 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | `E2-phone-otp` |
| Depends on | STORY-10 |

## User story

As a customer, I want to verify my phone with OTP before my request is sent (optional earlier, required at submit), so that the salon can SMS me if push fails.

## Acceptance criteria

- Guest request/verify OTP → unauthenticated.
- Session + valid E.164 request stores canonical unverified phone and sends a 6-digit code; junk phone rejected; another user’s number rejected.
- Verify with that code sets phone verified; create-booking succeeds when email is already verified (no phone fixture).
- Wrong code rejected; too many failed verifies throttled; expired code rejected; send throttle per phone and IP.
- If phone is already verified, request/verify are rejected; number unchanged.
- Request OTP is allowed while email is unverified; send still requires email then phone.
- Picker on phone unverified: stay on salon profile, phone + send code + 6-digit verify + retry send. `/bookings`: email panel if email unverified, else OTP panel if phone unverified.

## Out of scope

- OTP as login
- Changing a verified number
- Redis service in slim Compose
- CAPTCHA
- SMS fallback for booking status (STORY-32)
