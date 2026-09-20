# STORY-68 — Salon catalog boxed shops, Uredi, header plus

| Field | Value |
|-------|--------|
| ID | `STORY-68` |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-50, STORY-51, STORY-52 |

## User story

As an owner, I want my salon catalog as boxed shops with an Edit button and a plus under the title to add another shop, so that I can pick a shop or create one without a table list.

## Acceptance criteria

- `/owner/salons` keeps the existing owner overlay, OwnerNav **Saloni**, open-now rules, and not-owner → `/create-salon` path. This story **supersedes** STORY-50/52 catalog chrome only (hairline divided list; name-as-link; footer `Dodaj salon` text). Routes stay `/owner/salons`, `/owner/salons/create`, `/owner/salons/:id`. No new GraphQL.
- Directly under h1 `Saloni`: one Cal **primary** plus-only button (black, ~40px, white `+`). Accessible name **Dodaj salon** (`owner.addSalon`). Goes to `/owner/salons/create`. No add control under the list. Phone OwnerNav stays after that heading block (h1 + plus), then the shops.
- Shops are a stacked one-column list of sharp hairline boxes (same grammar as the salon-edit panel: `border border-hairline p-5`; not `rounded-lg`; not a `md+` 2-up grid). Still `max-w-xl`. One shop is still a box, not a divided row.
- Each box: left stack — salon **name** (plain text, not a link) over muted **Otvoreno** / **Zatvoreno** from that shop’s hours (STORY-50 open-now: inside today’s open interval and not in a break; closed weekday, break, or no hours → not open now). Right: **Uredi** (Cal secondary), vertically centered — the **only** control that goes to `/owner/salons/:id`. The box face is not a tap target. No kebab, address, stats, listed chip, photos, or `?salon=` switcher on the card.

## Out of scope

- First-shop `/create-salon`; plus does not onboard shop #1
- Add-salon form fields; salon-edit chips / hours / services / workers
- Per-box kebab into Informacije / Radno vrijeme / Usluge / Radnici
- Queue counts, occupying-job crumbs, or mini-stats on boxes
- Using the box as a salon switcher
- Delete / deactivate; photos; coordinates
- `md+` card grid
