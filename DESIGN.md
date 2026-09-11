---
version: alpha
name: Esyres
description: >-
  Index for two design packs that share the Cal visual system but differ by
  surface. Read the matching pack before UI work — do not mix company-pitch
  IA with product chrome.
---

## Overview

Esyres has **two design packs**. They share the same Cal tokens (white canvas, black CTAs, Cal Sans + Inter); they differ by **surface and composition**. Agents must read the correct pack before generating UI.

| Design | Scope | Spec |
|--------|--------|------|
| **Design 1** | **Company pitch** on typed `/` (one screen; then discovery) | [`refs/design-1/DESIGN.md`](refs/design-1/DESIGN.md) (Cal-adapted; provenance [designmd.co/d/cal](https://www.designmd.co/d/cal)) |
| **Design 2** | **Product PWA** after the pitch — discovery, salon, owner, worker (when built) | [`refs/design-2/DESIGN.md`](refs/design-2/DESIGN.md) + [`panel-ref.jpg`](refs/design-2/panel-ref.jpg) (skeleton only) |

**Same Cal system; separate packs.** Salon pages and `/owner` are never Design 1 long-scroll/hero landings. The company pitch is never owner-panel chrome. Do not mix pack IA even though tokens match.

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste.

## Which file to read

- Building **company pitch** on typed `/` → `refs/design-1/DESIGN.md`.
- Building **discovery / salon / owner** → `refs/design-2/DESIGN.md` (also `panel-ref.jpg` for owner skeleton), then `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` for product UX.
- Unsure → read this index first, then open the matching source.

## Skills (Design 1 only)

Use `landing-page` only when the user explicitly asks for the company pitch / Esyres landing on `/`. Do not use `pricing-page` (no public pricing). Use `build-awwwards-quality-sites` only when the user explicitly asks for pitch polish — never discovery, salon, or `/owner`. Code: [`esyres_app/frontend/`](esyres_app/frontend/). Never scaffold `esyres_app/marketing/`.

## Status

- **Design 1:** locked direction (Cal-based clean SaaS — white canvas, black CTAs, Cal Sans + Inter). MVP composition is **one screen** (hero + three how-it-works lines + one guest CTA). No long-scroll, feature grid, dark footer, or product mock.
- **Design 2:** locked direction (same Cal tokens + role composition; owner dark nav; `panel-ref.jpg` skeleton only; not a dashboard IA clone).
