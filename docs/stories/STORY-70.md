# STORY-70 — Request Detail Cal card

| Field | Value |
|-------|--------|
| ID | STORY-70 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-16, STORY-67 |

## User story

As an owner, I want Request Detail in the same Cal card as Zahtjevi, so that counter-propose is not a blank column after the month-and-list.

## Acceptance criteria

- `/owner/requests/:id` keeps the existing owner overlay (TopNav above aside + OwnerNav, `active="queue"`), no salon switcher, and no `?salon=`. STORY-70 **supersedes** STORY-16 Request Detail **chrome** only (bare `max-w-xl` column, no card). Route, `ownerBooking`, and mutations stay (`proposeTime`, `acceptPreferredTime`, `declineBooking`). Modes stay: form for `requested`; read for occupying (`confirmed` / `time_proposed`); bounce otherwise.
- Owner-ready main is: phone `h1` Zahtjevi + salon name + OwnerNav (`md:hidden` on those, same as Zahtjevi); **Nazad** above the card; then **one** white `{colors.canvas}` hairline card (`{rounded.lg}` 12px, `p-4`; no heavy shadow; no grey fill) spanning owner `main`. Drop `max-w-xl`. One column on phone and `md+` (no fake month | form split). Not the sharp salon-edit / catalog panel. Loading and auth stay uncarded like other owner pages.
- **In-card heading** is customer name + that mode’s clock (preferred on form and on bounce when the row loaded; occupying clock on read). Then existing meta (date · services · duration · worker). Owner pills unchanged (Predloži, Prihvati if named worker, Odbi two-step). Asistent + collapsed transcript stay. Closed day / no workers stay inside the card.
- Form, read, and bounce share that card. Bounce with a loaded row (`declined` / `cancelled`): heading + meta, then `Zahtjev više nije na čekanju.` FORBIDDEN / missing: bounce copy only (still in the card). The card is never an empty box.
- Predloži on pending and tap occupying still open this URL. Cal Design 1 only. Owner overlay inner unconstrained. Bosnian-first.

## Out of scope

- Chats, stats, salon catalog / edit chrome
- Customer phone / email; occupying list; WorkerPanel / drag
- Changing accept / propose / decline mutation contracts
- `?salon=` on this URL
- Guest picker chrome
