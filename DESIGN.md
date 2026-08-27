---
version: alpha
name: Esyres
description: >-
  Index for two design packs that share the Cal visual system but differ by
  surface. Read the matching pack before UI work — do not mix marketing IA
  with product chrome.
---

## Overview

Esyres has **two design packs**. They share the same Cal tokens (white canvas, black CTAs, Cal Sans + Inter); they differ by **surface and composition**. Agents must read the correct pack before generating UI.

| Design | Scope | Spec |
|--------|--------|------|
| **Design 1** | Esyres-the-company **marketing site** (landing, later pricing) | [`refs/design-1/DESIGN.md`](refs/design-1/DESIGN.md) (Cal-adapted; provenance [designmd.co/d/cal](https://www.designmd.co/d/cal)) |
| **Design 2** | **Product PWA** — customer, owner, worker (when built) | [`refs/design-2/DESIGN.md`](refs/design-2/DESIGN.md) + [`panel-ref.jpg`](refs/design-2/panel-ref.jpg) (skeleton only) |

**Same Cal system; separate packs.** Salon pages and `/owner` are never marketing long-scroll/hero landings. The marketing site is never owner-panel chrome. Do not mix pack IA even though tokens match.

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste.

## Which file to read

- Building **marketing landing** → `refs/design-1/DESIGN.md`.
- Building **PWA / salon / owner** → `refs/design-2/DESIGN.md` (also `panel-ref.jpg` for owner skeleton), then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` for product UX.
- Unsure → read this index first, then open the matching source.

## Skills (Design 1 only)

Use `landing-page`, `pricing-page`, `build-awwwards-quality-sites` only when the user explicitly says marketing site, Esyres landing, Esyres pricing page, or marketing homepage. Site code: [`esyres_app/marketing/`](esyres_app/marketing/).

## Status

- **Design 1:** locked direction (Cal-based clean SaaS marketing — white canvas, black CTAs, Cal Sans + Inter, in-card product UI mocks, dark footer).
- **Design 2:** locked direction (same Cal tokens + role composition; owner dark nav; `panel-ref.jpg` skeleton only; not a dashboard IA clone).
