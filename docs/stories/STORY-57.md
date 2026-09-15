# STORY-57 — Odjava as Cal destructive button

| Field | Value |
|-------|--------|
| ID | STORY-57 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-57` |
| Depends on | STORY-43 |

## User story

As a logged-in guest or owner, I want Odjava in the top-nav to look like a destructive action, so I can tell it apart from Panel and from Prijava.

## Acceptance criteria

- Both TopNav Odjava controls (homepage logged-in slot and session slot: `/bookings` + `/owner*`) use Cal `button-destructive`. Copy stays **Odjava**. One tap still logs out (same mutation, no confirm).
- Same geometry as Panel (`button-primary`): 40px height, 8px radius, `px-5`, Inter semibold, white label (`{colors.on-primary}`). Not `rounded-full`, not the salon 48px pill.
- Fill `{colors.error-strong}` `#dc2626`. `:active` `{colors.error-strong-active}` `#b91c1c`. No hover. Wire `--color-error-strong` and `--color-error-strong-active` only; do not add `--color-error` in this PR. Do not use `{colors.error}` `#ef4444` or `busy-busy` as the button fill.
- Homepage logged-in order stays **name → Odjava → Panel**. Prijava / Registracija stay body text. Create-salon slot stays empty.

## Out of scope

- Confirm dialog; Odjava hover
- Wiring `--color-error` or restyling form errors off `text-busy-busy`
- Owner Decline / customer cancel as `button-destructive`
- New logout surfaces (`/salons`, `/create-salon`)
- Copy change to Odjavi se
