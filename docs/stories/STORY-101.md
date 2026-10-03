# STORY-101 — Saved place and name

| Field | Value |
|-------|--------|
| ID | STORY-101 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | STORY-100 |

## User story

As a customer, I want to set my name and a place in Sarajevo, so that Nearby can use that place and stop asking the browser.

## Acceptance criteria

- `/my-profile/settings` uses the customer card pack. A guest sees the Rezervacije AuthShell.
- **Ime i prezime** is required, same rule as register. A blank name is refused. After **Sačuvaj**, `Dobrodošli, {name}` uses the new name.
- One municipality: Centar, Stari Grad, Novo Sarajevo, Novi Grad, Ilidža, Vogošća. Each name is one fixed point stored with the app. No geocoder and no map pin.
- **Sačuvaj** writes the name and the place together. Clearing the place removes the point.
- When a place is saved, `/salons` uses that point for Nearby and does not call the browser. When the place is empty, today’s browser prompt remains, then Popularno u Sarajevu.
- No email or phone gate.

## Out of scope

- A free-text address
- Changing email or password (password stays on `/owner/settings`)
- Moving salon coordinates
