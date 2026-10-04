---
version: alpha
name: Esyres
description: >-
  Index for two packs. Customer routes use the card pack.
  Owner and /create-salon stay Design 2 pastel.
---

## Overview

Customer routes and owner routes do not share one pack.

| Design | Scope | Spec |
|--------|--------|------|
| **Customer card** | `/`, `/salons`, `/salon/:id`, `/bookings`, `/my-profile`, `/my-profile/settings` | This file, customer card section. See `docs/adr/0049-customer-card-pack.md`. |
| **Design 2** | `/owner*`, `/create-salon` | [`refs/design-2/DESIGN.md`](refs/design-2/DESIGN.md) + [`wireframes.md`](refs/design-2/wireframes.md) (provenance [Intelly on Dribbble](https://dribbble.com/shots/23902200-Intelly-HealthCare-App-Dashboard)) |

Design 1 Cal (`refs/design-1/`) is superseded history. Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste. See `docs/adr/0039-design-2-pack.md`, `docs/adr/0049-customer-card-pack.md`, and `docs/adr/0040-owner-view-template.md`.

## Customer card

Cool gray page, white cards, Inter, black primary pills. One blue, used for stars only. Homepage sections stay (split hero, Kako radi, Za goste / Za salone, Popularno u Sarajevu, FAQ, dark footer) and only the chrome changes. AuthShell stays the centered box. Odjava stays the red pill. No photo header, revenue row, public URL, support toggle, or device logout.

- Canvas `#E8EEF3`
- Card `#FFFFFF`
- Ink `#14181F`
- Muted `#5C6770`
- Line `#E3E7EB`
- Blue `#2F6FED` (stars only)
- Primary `#14181F`, white label, pill
- Card radius 20px
- Shadow `0 8px 30px rgba(20,24,31,0.06)`

Affordance: every link and enabled button shows a pointer cursor. Non-primary buttons are pills with a `line` border; primary is the black pill; icon buttons are 36px bordered circles. Status reads as small neutral chips (no owner pastels).

Profile layout (`/my-profile`): one full-width header card (initials circle, name, saved place, counts, gear icon top-right), then `md+` two columns (left ~2/3 feed, right ~1/3 side cards). Postavke opens as a right Aside. `/bookings`: Na čekanju, then two highlight cards (Zadnje potvrđeno / Zadnje odbijeno), then a compact Historija list.

## Which file to read

- Customer route UI → this file’s customer card section, then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` (sparse customer).
- Owner route UI → `refs/design-2/DESIGN.md`, then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` (dense owner).
- Layout of an owner route → `refs/design-2/wireframes.md`.
- Unsure → this index first.

## Skills (homepage on `/` only)

Use `landing-page` only when the user explicitly asks for the homepage / Esyres landing on `/`. Do not use `pricing-page` (no public pricing). Use `build-awwwards-quality-sites` only when the user explicitly asks for homepage polish — never discovery, salon, or `/owner`. Code: [`esyres_app/frontend/`](esyres_app/frontend/). Never scaffold `esyres_app/marketing/`.

## Status

- **Customer card:** locked direction (2026-10-03) for `/`, `/salons`, `/salon/:id`, `/bookings`, `/my-profile`, `/my-profile/settings`.
- **Design 2:** locked direction (2026-09-29) for owner routes and `/create-salon`. Owner is not a marketing landing. No GSAP / 3D.
