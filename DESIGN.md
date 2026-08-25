---
version: alpha
name: Esyres
description: Index for two separate visual designs. Read the matching pack before UI work — do not mix.
---

## Overview

Esyres has **two designs**. Agents must read the correct pack before generating UI.

| Design | Scope | Spec |
|--------|--------|------|
| **Design 1** | Esyres-the-company **marketing site** (landing, later pricing) | [`refs/design-1/DESIGN.md`](refs/design-1/DESIGN.md) + JPG refs in same folder |
| **Design 2** | **Product PWA** — customer, owner, worker (when built) | [`refs/design-2/DESIGN.md`](refs/design-2/DESIGN.md) + [`panel-ref.jpg`](refs/design-2/panel-ref.jpg) |

**Do not mix Design 1 and Design 2.** Salon pages and `/owner` are never agency landings. The marketing site is never cream-pastel product chrome on marketing screens.

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste.

## Which file to read

- Building **marketing landing** → `refs/design-1/DESIGN.md` (also `layout-ref.jpg`, `salon-pixel-palette.jpg`).
- Building **PWA / salon / owner** → `refs/design-2/DESIGN.md` (also `panel-ref.jpg`), then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` for product UX.
- Unsure → read this index first, then open the matching source.

## Skills (Design 1 only)

Use `landing-page`, `pricing-page`, `build-awwwards-quality-sites` only when the user explicitly says marketing site, Esyres landing, Esyres pricing page, or marketing homepage. Do not scaffold a marketing site unless asked.

## Status

- **Design 1:** locked direction (bento layout + pixel salon palette).
- **Design 2:** locked direction (cream/pastel/charcoal tokens + role composition; not a dashboard IA clone).
