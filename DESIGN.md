---
version: alpha
name: Esyres
description: >-
  Index for one Cal design pack. Read refs/design-1 before UI work.
  Homepage IA stays on `/` only; owner stays a dense panel.
---

## Overview

Esyres has **one design pack**: Design 1 (Cal — white canvas, black CTAs, Cal Sans + Inter). Discovery, salon, and `/owner` share those tokens. Homepage composition (header + hero + footer) stays on `/` only. Owner keeps dense queue + 15-minute grid with Cal light chrome (no dark nav).

| Design | Scope | Spec |
|--------|--------|------|
| **Design 1** | Homepage on `/`, discovery, salon, owner | [`refs/design-1/DESIGN.md`](refs/design-1/DESIGN.md) (Cal-adapted; provenance [designmd.co/d/cal](https://www.designmd.co/d/cal)) |

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste. See `docs/adr/0026-one-design-1-pack.md`. STORY-42 moves busy/cell tokens into Design 1 and deletes `refs/design-2`.

## Which file to read

- Any PWA UI → `refs/design-1/DESIGN.md`, then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` for product UX (sparse customer, dense owner).
- Unsure → this index first.

## Skills (homepage on `/` only)

Use `landing-page` only when the user explicitly asks for the homepage / Esyres landing on `/`. Do not use `pricing-page` (no public pricing). Use `build-awwwards-quality-sites` only when the user explicitly asks for homepage polish — never discovery, salon, or `/owner`. Code: [`esyres_app/frontend/`](esyres_app/frontend/). Never scaffold `esyres_app/marketing/`.

## Status

- **Design 1:** locked direction (Cal-based clean SaaS — white canvas, black CTAs, Cal Sans + Inter). `/` is a short-scroll homepage (header + existing hero + simple footer). No feature grid, product mock, or dark footer. Owner is not a marketing landing.
