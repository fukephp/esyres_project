# STORY-98 — Auth box

| Field | Value |
|-------|--------|
| ID | STORY-98 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | — |
| Depends on | STORY-11, STORY-71 |

## User story

As a customer or someone opening a panel, I want one centered login box with Prijava / Registracija tabs and forgot password on every surface, so that signing in looks and works the same everywhere and I can recover a lost password myself.

## Acceptance criteria

- One `AuthShell` behavior on every auth surface: homepage auth, `/bookings`, `/create-salon`, the salon Pošalji zahtjev modal, assistant intake, and every `/owner*` gate. Registracija shows on all of them, owner routes included. The `allowRegister` prop is gone.
- Page surfaces: one card centered horizontally and vertically under the TopNav (canvas fill, hairline border, `rounded-3xl`, ~400px wide). The place heading (**Rezervacije** or **Panel**) is centered at the top inside the card. In modals the modal is the box: same tabs, animation, and form, with no inner card.
- Tabs: chips **Prijava** / **Registracija** in the salon edit chip shape. Inactive chips are plain text with no fill. Only the active chip is a black pill (`bg-ink`, `text-canvas`).
- Animation: the black pill slides between chips. The panel slides left or right in the tab direction with a fade (~200ms, CSS only, no new dependency). The box height animates. Reduced motion switches instantly.
- Fields stay Design 2 `field` inputs with the full-width black pill submit. Password fields get a show/hide eye toggle. No subtitle, no Google login, no "Or" divider.
- Forgot password: a **Zaboravljena lozinka?** link under Lozinka on Prijava slides in the forgot pane with the same animation. **Nazad na prijavu** slides back. Not a third chip.
- Forgot pane takes an email. Submit always shows `Ako račun postoji, poslali smo link.` whether or not the account exists.
- Reset uses the Laravel password broker on `password_reset_tokens`: link valid 60 minutes, single use, 1 send per minute per email. The mail is a queued notification like the verify mail.
- The link opens `/reset-password?token=…&email=…` in the same centered box with **Nova lozinka** (minimum 8, existing `WEAK_PASSWORD`). A logged-in user may open it.
- Success logs out every session of that user (the current one too when it is the same user) and does not log in. The box shows `Lozinka je promijenjena.` on the Prijava tab with the email filled in.
- GraphQL: guest `requestPasswordReset(email)` (always true) and `resetPassword(email, token, password)`. A bad or expired token is `INVALID_RESET_TOKEN` and shows `Link je istekao ili nije ispravan.` with a button back to the forgot pane.
- Backend files change, so verify is full Behat (the frontend-only classifier fails).

## Out of scope

- Google or other social login
- A subtitle under the heading
- A third Lozinka chip
- Auto-login after reset
- Phone OTP login changes
- Customer settings or a password change outside `/owner/settings`
