---
version: alpha
name: Esyres Product PWA
description: >-
  Design 2 — Product PWA visual system (customer, owner, later worker).
  Cream canvas, pastel surface accents, charcoal CTAs. Tokens + composition
  rules only — not a medical-dashboard layout clone. Do not apply to marketing.
colors:
  canvas: "#F9F6F0"
  charcoal: "#1A1A1A"
  on-charcoal: "#FFFFFF"
  surface: "#FFFFFF"
  text: "#1A1A1A"
  text-muted: "#6B6560"
  pastel-yellow: "#F2D58E"
  pastel-pink: "#EDC0DD"
  pastel-green: "#A4C684"
  pastel-blue: "#B8D4F0"
  busy-free: "#22C55E"
  busy-moderate: "#EAB308"
  busy-busy: "#EF4444"
  cell-free: "#86EFAC"
  cell-pending: "#FCD34D"
  cell-proposed: "#93C5FD"
  cell-booked: "#1A1A1A"
  cell-off: "#D6D3D1"
typography:
  greeting:
    fontFamily: Fraunces
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.2
  h1:
    fontFamily: Fraunces
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
  h2:
    fontFamily: Fraunces
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.04em
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: 16px
  md: 24px
  lg: 32px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.on-charcoal}"
    rounded: "9999px"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.charcoal}"
    rounded: "9999px"
    padding: 14px
  bento-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  bento-accent:
    rounded: "{rounded.md}"
  owner-nav:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.on-charcoal}"
---

## Overview

Design 2 is the **product PWA** look — customer funnel, owner tools, and (Phase 2) worker UI. It locks **tokens + composition rules**, not a 1:1 clone of any reference dashboard.

Reference in this folder:

- **`panel-ref.jpg`** — **palette, radius, type vibe only** (cream canvas, soft pastel bento, charcoal chrome, serif greeting + sans UI). Do **not** copy the medical IA, KPI charts, patient detail panels, or required mini-calendar rail.

**Do not apply Design 2 to the Esyres marketing site.** Marketing uses [`refs/design-1/DESIGN.md`](../design-1/DESIGN.md).

Product UX still wins via `docs/mvp/` and `.cursor/rules/frontend/` when it conflicts with visual taste. Copy is Bosnian-first; prices in KM.

When the PWA is scaffolded, map these tokens to Tailwind/CSS variables. Until then, this file is the source of truth.

## GOAL

- Calm, trustworthy salon booking UI for Sarajevo.
- Customer: frictionless QR → browse → request (no dashboards).
- Owner: dense, actionable queue + Worker Availability Panel in the same visual language.
- Success: one clear hierarchy per screen; pastel warmth without rainbow status confusion.

## FORMAT

- Customer: mobile-first, single column; safe margins ~16–20px.
- Owner: tablet/desktop primary; phone must still work (collapse nav, stack regions, tap-to-propose fallback).
- Large corner radius throughout (`rounded.sm`–`lg` ≈ Tailwind `rounded-2xl`–`3xl`).

## LAYOUT (composition rules)

### Customer (sparse)

- No charcoal sidebar, no right schedule rail, no KPI card grids, no charts.
- Cream canvas; charcoal primary CTAs; soft white/pastel chips and at most one accent block when it aids the funnel (e.g. busy-day hint, confirmation).
- Surfaces: Profile, Bookmarks/Favorites, Search/Discover, Schedule/Reschedule — narrow by product design.

### Owner (dense)

Desktop/tablet default regions:

1. **Charcoal left nav** — primary destinations; salon switcher if multi-salon.
2. **Main** — pending-request queue + Worker Availability Panel on pastel/white bento surfaces; charcoal CTAs.
3. **Optional right rail** — “today’s proposed/confirmed” strip only when useful. Mini-month calendar is **not** required chrome.

Phone: collapse or bottom nav; stack queue above availability.

### Worker (deferred)

Same tokens and chrome family as owner when built. Not MVP — do not invent worker screens under this pack.

## TYPE SYSTEM

- **Titles / greetings:** Fraunces, weight 600–700.
- **UI chrome / body / nav / buttons:** Plus Jakarta Sans — body 400, labels/buttons 600.
- Never use Design 1 Satoshi or pixel-label typography on the PWA.
- Hierarchy: one greeting or H1 → short support → primary action.

## COLOR + MATERIAL

### Surfaces (decorative — not status)

| Token | Hex | Use |
|--------|------|-----|
| canvas | `#F9F6F0` | Page background |
| surface | `#FFFFFF` | Default cards on cream |
| pastel-yellow | `#F2D58E` | Accent bento / section fill |
| pastel-pink | `#EDC0DD` | Accent bento / soft chips |
| pastel-green | `#A4C684` | Accent bento |
| pastel-blue | `#B8D4F0` | Accent bento |
| charcoal | `#1A1A1A` | Owner nav, primary CTA, strong text |
| text-muted | `#6B6560` | Secondary copy |

Pastels may be reused freely by layout. They must **not** encode booking or busy meaning.

### Status (separate, higher contrast)

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

- Soft bento cards, thin-line icons, pill buttons (`rounded-full` for primary actions).
- Calm salon product UI — not agency landing, not medical EMR chrome.
- Depth from cream vs white/pastel fills and large radius — not glass, glow, or multi-layer shadows.
- Real salon photography only when product needs it; decorative gradients alone are not the main visual idea on marketing (N/A here). Prefer quiet UI over hero photography on owner tools.

## CONSTRAINTS

```text
FONT   FRAUNCES + PLUS JAKARTA SANS
STYLE  CREAM PASTEL BENTO
MODE   LIGHT
CTA    CHARCOAL
```

- Change one variable at a time when iterating variants.
- Product routes (`/`, salon pages, `/owner`) never inherit Design 1 pixel/magenta marketing look.

## NEGATIVE PROMPT

- No Design 1 Satoshi / pixel / magenta / cobalt marketing chrome on the PWA.
- No customer dashboards, KPI strips, visit charts, or medical patient-detail panels.
- No pastel washes used as busy/availability status.
- No required mini-month calendar as owner chrome.
- No slot-grid for customers (day + busy badge only).
- No logos/watermarks from reference sites; no “intelly” branding.
- No purple-on-white SaaS default; no terracotta-serif cream cliché beyond this locked palette.
- Do not invent colors outside this file — extend tokens here first.

## Tailwind (later)

When `esyres_app` exists, expose these as CSS variables / Tailwind theme keys (e.g. `--color-canvas`, `--color-pastel-pink`). Do not hardcode one-off hexes in components. This markdown remains the locked source until that theme lands.

## Do's and Don'ts

**Do**

- Read this file and `panel-ref.jpg` before generating PWA UI.
- Keep customer sparse and owner dense.
- Keep Bosnian-first copy and KM prices.
- Prefer `docs/mvp/` for flows; this file for look.

**Don't**

- Do not apply this pack to the marketing site.
- Do not clone the reference’s three-column medical dashboard IA.
- Do not build worker UI in MVP.
- Do not mix Design 1 and Design 2 on the same screen.
