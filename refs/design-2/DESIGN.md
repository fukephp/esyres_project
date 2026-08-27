---
version: alpha
name: Esyres Product PWA
description: >-
  Design 2 — Product PWA visual system (customer, owner, later worker).
  Same Cal design system as Design 1 (https://www.designmd.co/d/cal):
  white canvas, black primary CTAs, Cal Sans + Inter, soft ~8–12px radius.
  Separate pack by surface/composition (sparse customer / dense owner), not
  by palette. Do not apply marketing IA to product routes.
colors:
  primary: "#111111"
  primary-active: "#242424"
  primary-disabled: "#e5e7eb"
  ink: "#111111"
  body: "#374151"
  muted: "#6b7280"
  muted-soft: "#898989"
  hairline: "#e5e7eb"
  hairline-soft: "#f3f4f6"
  canvas: "#ffffff"
  surface-soft: "#f8f9fa"
  surface-card: "#f5f5f5"
  surface-strong: "#e5e7eb"
  surface-dark: "#101010"
  surface-dark-elevated: "#1a1a1a"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "#a1a1aa"
  brand-accent: "#3b82f6"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
  busy-free: "#22C55E"
  busy-moderate: "#EAB308"
  busy-busy: "#EF4444"
  cell-free: "#86EFAC"
  cell-pending: "#FCD34D"
  cell-proposed: "#93C5FD"
  cell-booked: "#1A1A1A"
  cell-off: "#D6D3D1"
typography:
  display-sm:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  title-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.3px
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  owner-nav:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.nav-link}"
  queue-surface:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  availability-panel:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  customer-top-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 56px
---

## Overview

Design 2 is the **product PWA** look — customer funnel, owner tools, and (Phase 2) worker UI. It locks **tokens + composition rules**, not a 1:1 clone of any reference dashboard.

**Provenance:** Same visual system as Design 1, adapted from [Cal.com DESIGN.md on designmd.co](https://www.designmd.co/d/cal). Brand/surface/type/radius tokens match Design 1 (self-contained here so this pack reads alone). Packs stay separate by **surface and composition** — marketing IA vs product chrome — not by palette.

Reference in this folder:

- **`panel-ref.jpg`** — **owner panel skeleton / density only** (left nav, main queue + availability, optional rail). Ignore cream/pastel/serif/medical IA, KPI charts, patient panels, and required mini-calendar from the image. Visual truth is the tokens in this file.

**Do not apply Design 2 to the Esyres marketing site.** Marketing uses [`refs/design-1/DESIGN.md`](../design-1/DESIGN.md). Do not apply marketing long-scroll/hero IA to product routes.

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste. Copy is Bosnian-first; prices in KM.

When the PWA is scaffolded, map these tokens to Tailwind/CSS variables. Until then, this file is the source of truth.

## GOAL

- Calm, trustworthy salon booking UI for Sarajevo.
- Customer: frictionless QR → browse → request (no dashboards).
- Owner: dense, actionable queue + Worker Availability Panel in the same Cal visual language.
- Success: one clear hierarchy per screen; status colors stay functional and separate from brand chrome.

## FORMAT

- Customer: mobile-first, single column; safe margins ~16–20px.
- Owner: tablet/desktop primary; phone must still work (collapse nav, stack regions, tap-to-propose fallback).
- Radius hierarchy matches Cal: buttons/inputs `{rounded.md}` (8px); content panels `{rounded.lg}` (12px). Do not use pill primary CTAs.

## LAYOUT (composition rules)

### Customer (sparse)

- No dark sidebar, no right schedule rail, no KPI card grids, no charts.
- White canvas; primary black CTAs; hairline borders; at most one soft surface block when it aids the funnel (e.g. busy-day hint, confirmation).
- Surfaces: Profile, Bookmarks/Favorites, Search/Discover, Schedule/Reschedule — narrow by product design.

### Owner (dense)

Desktop/tablet default regions (see `panel-ref.jpg` for skeleton density only):

1. **Dark left nav** (`{colors.surface-dark}`) — primary destinations; salon switcher if multi-salon.
2. **Main** — pending-request queue + Worker Availability Panel on white / `{colors.surface-card}` surfaces; primary CTAs.
3. **Optional right rail** — “today’s proposed/confirmed” strip only when useful. Mini-month calendar is **not** required chrome.

Phone: collapse or bottom nav; stack queue above availability.

### Worker (deferred)

Same tokens and chrome family as owner when built. Not MVP — do not invent worker screens under this pack.

## TYPE SYSTEM

- **Page titles / greetings:** Cal Sans (`display-sm` / `title-lg` weight 600), negative letter-spacing where specified.
- **UI chrome / body / nav / buttons / labels:** Inter — body 400, labels/buttons 600.
- Never put body in Cal Sans; never put dense panel chrome in a decorative serif.
- Hierarchy: one title or H1 → short support → primary action.
- Self-host Cal Sans (same as marketing). Load Inter via CDN or self-host. If Cal Sans is unavailable, Inter 600 with ≈ -0.04em tracking is the fallback.

## COLOR + MATERIAL

### Brand & surfaces (Cal parity with Design 1)

| Token | Hex | Use |
|--------|------|-----|
| canvas | `#ffffff` | Page background |
| surface-soft | `#f8f9fa` | Soft dividers |
| surface-card | `#f5f5f5` | Panels, availability chrome |
| surface-dark | `#101010` | Owner left nav (scarce dark signal) |
| primary | `#111111` | Primary CTAs, strong text |
| hairline | `#e5e7eb` | 1px borders on light surfaces |
| ink / body / muted | `#111111` / `#374151` / `#6b7280` | Text hierarchy |

Brand accent (`#3b82f6`) is spare use only (rare inline link). Never on primary CTAs.

### Status (Design-2-only — higher contrast; not brand chrome)

**Customer busy badge** (day-level — keep 🟢 / 🟡 / 🔴 semantics):

| State | Token | Hex |
|--------|--------|-----|
| Free / light | `busy-free` | `#22C55E` |
| Moderate | `busy-moderate` | `#EAB308` |
| Busy | `busy-busy` | `#EF4444` |

**Owner availability cells** (intentionally diverge from customer badges):

| State | Token | Hex |
|--------|--------|-----|
| Free | `cell-free` | `#86EFAC` |
| Pending | `cell-pending` | `#FCD34D` |
| Proposed | `cell-proposed` | `#93C5FD` |
| Booked | `cell-booked` | `#1A1A1A` (light label) |
| Off | `cell-off` | `#D6D3D1` |

## IMAGERY / UI STYLE

- Soft panels with hairline borders; thin-line icons; primary buttons at `{rounded.md}` (not pills).
- Calm salon product UI — not agency landing, not medical EMR chrome.
- Depth from white vs `{colors.surface-card}` fills and 8–12px radius — not glass, glow, or multi-layer shadows.
- Real salon photography only when product needs it. Prefer quiet UI over hero photography on owner tools.

## CONSTRAINTS

```text
FONT   CAL SANS + INTER
STYLE  CLEAN CAL SAAS (PRODUCT COMPOSITION)
MODE   LIGHT (+ dark owner nav)
CTA    PRIMARY #111111
```

- Change one variable at a time when iterating variants.
- Product routes (`/`, salon pages, `/owner`) never inherit marketing long-scroll, hero bands, or dark-footer page endings.

## NEGATIVE PROMPT

- No cream canvas, decorative pastel washes, Fraunces, Plus Jakarta Sans, or oversized 24–32px “bento” radius.
- No pill primary CTAs.
- No customer dashboards, KPI strips, visit charts, or medical patient-detail panels.
- No status encoded with brand accent or decorative pastels — use busy/cell tokens only.
- No required mini-month calendar as owner chrome.
- No slot-grid for customers (day + busy badge only).
- No logos/watermarks from reference sites.
- No purple-on-white SaaS default; no terracotta-serif cream cliché.
- Do not invent colors outside this file — extend tokens here first.
- Do not apply Design 1 marketing IA (hero, feature grids, dark footer page close) on product screens.

## Tailwind (later)

When `esyres_app` PWA theme exists, expose these as CSS variables / Tailwind theme keys (e.g. `--color-canvas`, `--color-primary`, `--color-busy-free`). Do not hardcode one-off hexes in components. This markdown remains the locked source until that theme lands.

## Do's and Don'ts

**Do**

- Read this file before generating PWA UI; use `panel-ref.jpg` for owner skeleton density only.
- Keep customer sparse and owner dense.
- Keep Bosnian-first copy and KM prices.
- Prefer `docs/mvp/` for flows; this file for look.
- Keep busy-badge vs availability-cell tokens separate.

**Don't**

- Do not apply this pack to the marketing site.
- Do not clone the reference image’s medical dashboard IA or its cream/pastel look.
- Do not build worker UI in MVP.
- Do not put marketing long-scroll/hero composition on product routes.
