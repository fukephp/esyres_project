# STORY-24 — Assistant send gates

| Field | Value |
|-------|--------|
| ID | STORY-24 |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | — |
| Depends on | STORY-21, STORY-11, STORY-12 |

## User story

As a customer, I want send gates to stay the same as the picker (login, verified email, phone OTP), so that the salon still gets a reachable guest. If I am already verified, I want one confirm at the end.

## Acceptance criteria

- Chat cannot skip login, verified email, or phone OTP.
- Send still creates requested only when those gates pass.
- Already-verified users confirm once at the end (no second email/OTP dance).
- Unverified users complete the same email + OTP flow as the picker before send.

## Out of scope

- Weakening picker gates
- OTP as login
- Owner-side send
