# STORY-46 — Person name at register; Rezervacije vs Panel

| Field | Value |
|-------|--------|
| ID | STORY-46 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | — |
| Depends on | STORY-10, STORY-11, STORY-40, STORY-41, STORY-43 |

## User story

As a customer or someone opening a panel, I want to type my Ime i prezime when I register and see Rezervacije or Panel on the auth shell, so that my name is real and I know which door I opened.

## Acceptance criteria

- GraphQL `register` requires `name` (with email, password, optional phone). Trim it. Missing or whitespace-only is rejected; the register UI shows `Unesi ime i prezime.` One word (`Ana`) is enough. Do not mint `users.name` from the email local-part. After a successful register, `me.name` is that trimmed string. Login is still email+password with no name field. Existing rows are not backfilled.
- Register UI (customer and `/create-salon`): first field **Ime i prezime**, then email, password, optional phone. Tabs stay Prijava / Registracija. `/owner*` AuthShell stays login-only (`allowRegister` false).
- Two place headings, same string for login and register: customer **Rezervacije**, panel **Panel**. Full-page shells use the 28px `h1`. Salon send and assistant use the customer heading as a line above AuthShell, not a page `h1`.
- Customer heading on homepage AuthShell, logged-out `/bookings` AuthShell, salon send AuthShell, and assistant AuthShell. After login, `/bookings` stays `Moji zahtjevi`. Logged-in customer email-verify stays as today.
- Panel heading on `/create-salon` AuthShell and email-verify, and on all `/owner*` logged-out AuthShell and email-verify. Logged-out owner must not use `Zahtjevi` / `Chat` / `Statistika` as that title. After session, those owner page titles return. Create-salon **Ime salona** form has no Panel heading.
- Homepage: while AuthShell is open, hide pitch + footer; **Rezervacije** is the `h1`. Form stays left (`max-w-sm`). Not a login wall — closing auth (or succeeding) brings pitch + footer back. Pronađi salon still works when auth is closed.

## Out of scope

- Header person name as a Link
- Centering AuthShell
- Odjava hover
- `/profil`, `/prijava`, `/registracija` routes
- OAuth
- Requiring a space / two words
- Backfill or a name editor
- Second owner signup
- Public pricing page
