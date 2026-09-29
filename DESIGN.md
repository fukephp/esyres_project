---
version: alpha
name: Esyres
description: >-
  Index for one design pack. Read refs/design-2 before UI work.
  Cream canvas, black owner sidebar, pastel status cards; owner picks Kalendar or Kanban.
---

## Overview

Esyres has **one design pack**: Design 2 (pastel — cream canvas, black owner sidebar, pastel status cards, Bricolage Grotesque + Manrope). Homepage, discovery, salon, and `/owner` share those tokens. Owner routes live in one shell (black sidebar on `md+`, bottom tabs on phone). Zahtjevi and Zapisi render the owner's **Prikaz** (Kalendar week grid or Kanban status board), chosen in Postavke.

| Design | Scope | Spec |
|--------|--------|------|
| **Design 2** | Homepage on `/`, discovery, salon, owner | [`refs/design-2/DESIGN.md`](refs/design-2/DESIGN.md) + [`wireframes.md`](refs/design-2/wireframes.md) (provenance [Intelly on Dribbble](https://dribbble.com/shots/23902200-Intelly-HealthCare-App-Dashboard)) |

Design 1 Cal (`refs/design-1/`) is superseded history. Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste. See `docs/adr/0039-design-2-pack.md` and `docs/adr/0040-owner-view-template.md`.

## Which file to read

- Any PWA UI → `refs/design-2/DESIGN.md`, then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` for product UX (sparse customer, dense owner).
- Layout of a specific route → `refs/design-2/wireframes.md`.
- Unsure → this index first.

## Skills (homepage on `/` only)

Use `landing-page` only when the user explicitly asks for the homepage / Esyres landing on `/`. Do not use `pricing-page` (no public pricing). Use `build-awwwards-quality-sites` only when the user explicitly asks for homepage polish — never discovery, salon, or `/owner`. Code: [`esyres_app/frontend/`](esyres_app/frontend/). Never scaffold `esyres_app/marketing/`.

## Status

- **Design 2:** locked direction (2026-09-29). `/` has split hero, Kako radi, Za goste / Za salone, Popularno u Sarajevu, FAQ, dark footer. No GSAP / 3D. Owner is not a marketing landing.
