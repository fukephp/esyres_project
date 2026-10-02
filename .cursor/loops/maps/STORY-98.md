# Story map: STORY-98

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-98 |
| Source | `docs/stories/STORY-98.md` — Auth box |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-98.md` (after compile) |

## Destination

One `AuthShell` (card on pages, bare in modals) with sliding Prijava / Registracija chips, eye toggle, and a forgot pane on every auth surface; Laravel-broker password reset via `requestPasswordReset` / `resetPassword` and a PWA `/reset-password` page that kills that user's sessions and lands on Prijava.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/architecture/06-Auth-Notifications-Realtime.md`, `docs/adr/0046-password-reset-broker.md`, glossary **Auth box**
- Backend touched → full Behat
- Existing: `VerifyEmail` notification (Laravel subclass + `ShouldQueue`), `SpaUrl` for PWA links, `sessions` table with `user_id` (prod `SESSION_DRIVER=database`; Behat `array`), `password_reset_tokens` table already migrated, `auth.passwords.users` broker config present
- Owner logged-out gates render `TopNav` + `PLACE_HEADING_CLASS` + `AuthShell allowRegister={false}`; homepage/bookings/create-salon same shape with their headings

## Decisions so far

- `allowRegister` prop removed; Registracija on every surface (story AC)
- Reset link = `SpaUrl::origin()/reset-password?token=…&email=…` via `ResetPassword::createUrlUsing` (or subclass `toMail` URL)
- Reset mail = `App\Notifications\ResetPassword` extending Laravel's, `ShouldQueue` + `Queueable`, sent via `sendPasswordResetNotification` override on `User`
- `requestPasswordReset` returns true for unknown email, throttled, and success alike (broker `throttle` 60s, `expire` 60)
- `resetPassword`: `WEAK_PASSWORD` checked before the broker (token not consumed); any broker failure (bad token, expired, unknown email) → `INVALID_RESET_TOKEN`
- A different logged-in user resetting someone else's password stays logged in; same user → current session logged out
- Eye toggle aria labels Bosnian (`Prikaži lozinku` / `Sakrij lozinku`)
- Height animation: `ResizeObserver` + CSS `transition-[height]`; panel slide via CSS transform/opacity; `motion-reduce:transition-none`; no new npm package
- Q1: delete `sessions` rows for that `user_id` + rotate `remember_token`; same-user current session → logout + invalidate. Behat seeds a `sessions` row and asserts it is gone, and `me` is null after a same-user reset
- Q2: `/reset-password` uses TopNav empty slot (greeting when named); card heading **Rezervacije**
- Q3: login from the reset page's Prijava → navigate `/`
- Q4: `variant="modal"` = no card, no place heading; salon and assistant keep their own copy
- Q5: Laravel default reset mail text; only URL + queue customized

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- Google / social login, subtitle, third Lozinka chip, auto-login after reset, phone OTP login changes, customer password change outside `/owner/settings`
