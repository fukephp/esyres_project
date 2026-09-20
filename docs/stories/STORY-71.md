# STORY-71 — Owner settings password

| Field | Value |
|-------|--------|
| ID | STORY-71 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-10, STORY-50 |

## User story

As an owner, I want to change my password on `/owner/settings`, so that I can rotate the shared credential without a founder reset.

## Acceptance criteria

- `/owner/settings` is a lazy owner route with the same overlay as the salon catalog (TopNav + aside + OwnerNav). OwnerNav **Postavke** is on every owner route, fifth after Saloni (`active: 'settings'`). No `?salon=`. Logged-out / unverified-email / not-owner shells match `/owner`.
- Page: h1 **Postavke**; muted read-only email from `me`; form **Trenutna lozinka** / **Nova lozinka** / **Ponovi lozinku**; submit **Spremi** (`owner.save`). Confirm mismatch is UI-only (`Lozinke se ne poklapaju.`) — do not submit. No name or email edit. No show/hide toggles.
- Sessioned GraphQL `changePassword(currentPassword, password)` — any logged-in user; UI only on this page. Wrong current → `INVALID_CURRENT_PASSWORD` (`Pogrešna trenutna lozinka.`), not login’s `INVALID_CREDENTIALS`. New password shorter than 8 → existing `WEAK_PASSWORD`. New may equal current.
- Success: stay signed in (regenerate session); clear the three fields; `Lozinka je promijenjena.` No other-devices UI; other cookies keep working.

## Out of scope

- Customer `/settings` or My Bookings password UI
- Forgot-password / `password_reset_tokens`
- Email or name change, 2FA, language, devices
- Salon PIN or an owner-only second password
- Worker logins
