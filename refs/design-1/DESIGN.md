---
version: alpha
name: Esyres Marketing Landing
description: >-
  Design 1 — Esyres-the-company marketing site (landing, later pricing).
  Bento layout + isometric pixel-art salon culture. Do not apply to the product PWA.
colors:
  primary: "#1E1B4B"
  secondary: "#6366F1"
  tertiary: "#D946EF"
  tertiary-hover: "#E879F9"
  on-tertiary: "#FFFFFF"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  gradient-start: "#FFFFFF"
  gradient-end: "#C4B5FD"
  cobalt: "#2563EB"
  cobalt-light: "#3B82F6"
  outline: "#312E81"
  pop-coral: "#F43F5E"
  pop-cyan: "#22D3EE"
typography:
  h1:
    fontFamily: Satoshi
    fontSize: 3.5rem
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em
  h2:
    fontFamily: Satoshi
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  h3:
    fontFamily: Satoshi
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.3
  body-md:
    fontFamily: Satoshi
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Satoshi
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: Satoshi
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.06em
rounded:
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.md}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-hover}"
    textColor: "{colors.on-tertiary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 14px
  section-shell:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
  feature-card-emphasis:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.lg}"
  pixel-icon-tile:
    backgroundColor: "{colors.cobalt-light}"
    rounded: "{rounded.lg}"
---

## Overview

Design 1 is the **Esyres-the-company marketing site** — landing first, pricing/polish later. Location undecided.

Two references in this folder define the look:

- **`layout-ref.jpg`** — page structure (airy bento, centered nav, soft mega-rounded sections).
- **`salon-pixel-palette.jpg`** — art culture and **locked palette** (isometric pixel salon).

**Layout from the first ref. Culture and colors from the second.** Do not use the orange/lavender accents from the layout ref — those belong to the reference site, not Esyres.

**Do not apply Design 1 to the product PWA** (`/`, `/owner`, salon pages). Product look is [`refs/design-2/DESIGN.md`](../design-2/DESIGN.md).

Copy is Bosnian-first. Offer: structured salon reservations in Sarajevo (guest picks day → owner proposes time → guest confirms).

## Colors

Palette locked to `salon-pixel-palette.jpg`. Retro-digital salon, not generic SaaS purple-orange.

- **Primary (#1E1B4B):** Headlines, nav text, pixel outlines.
- **Secondary (#6366F1):** Muted supporting text, indigo captions.
- **Tertiary / CTA (#D946EF):** Primary buttons, chair accent, key highlights. Hover: #E879F9.
- **Neutral / surface (#FFFFFF):** Page base, tile counters, card fills.
- **Gradient (#FFFFFF → #C4B5FD):** Page background atmosphere (soft lavender/violet).
- **Cobalt (#2563EB – #3B82F6):** Secondary UI, cabinet surfaces, icon tile backgrounds, one emphasized feature card.
- **Outline (#312E81):** 1–2px pixel-outline energy on icons and borders.
- **Pop coral / cyan (#F43F5E / #22D3EE):** Tiny bottle-style accents only — never as primary UI chrome.

## Typography

Geometric bold sans (Satoshi vibe — or General Sans / Clash Grotesk equivalent). Readable body; optional **micro pixel labels** for badges only — not a full pixel font for paragraphs.

- H1: large, tight, one message per viewport.
- Body: airy leading; short Bosnian sentences.
- Labels: semibold, wider tracking for stats and section tags.

## Layout

Desktop-first marketing page, responsive to mobile. Safe margins: ~48–64px desktop, ~20–24px mobile.

**First viewport only:** brand **Esyres** (hero-level, centered nav) + one H1 + one support line + one CTA group + one dominant isometric pixel salon visual. No stats strip, no floating promo badges on the art.

**Below the fold:**

1. **Nav** — links split L/R, brand mark + wordmark centered.
2. **Hero** — type left/center; dominant pixel salon right or as background plane.
3. **Icon strip** — row of 4 rounded pixel-icon tiles (salon motifs) with prev/next.
4. **Feature section** — large soft-rounded shell, 3 vertical cards (one cobalt/magenta emphasis).
5. **Footer CTA** — soft-rounded shell + contact/social row.

Hierarchy: Brand → H1 → support → primary CTA → secondary text.

## Elevation & Depth

Soft bento shells with very large corner radius. Depth from pixel shading and indigo outlines — not glass, glow stacks, or plastic 3D.

- Section shells: white on lavender gradient, subtle border or pixel shadow.
- Hero pixel art: isometric salon plane with crisp pixel edges and dither.
- Sparkles OK only as pixel stars — not glossy stickers on top of hero art.

## Shapes

Mega-rounded section containers (`rounded.xl` / `rounded.lg`). Icon tiles are rounded squares, not circles. Buttons use `rounded.md`. Pixel art keeps hard pixel edges inside soft UI chrome.

## Components

**Primary button** — magenta fill, white label, medium radius, optional arrow.

**Secondary button** — white fill, navy text, indigo outline.

**Section shell** — white, extra-large radius, holds a full section (Our Class / benefits equivalent).

**Feature card** — vertical card with title, body, circular arrow affordance; one card uses cobalt or magenta fill as emphasis.

**Pixel icon tile** — rounded square, cobalt background, isometric pixel salon icon (scissors, chair, mirror, calendar-day).

**Hero visual** — full isometric pixel salon scene matching `salon-pixel-palette.jpg` (mirrors, magenta chairs, blue cabinets, white tile floor).

## Do's and Don'ts

**Do**

- Read this file and both JPG refs before generating marketing UI.
- Use pixel salon motifs instead of 3D clay tool icons.
- Keep Bosnian copy; primary CTA: salon onboarding / waitlist.
- Use gated skills (`landing-page`, `pricing-page`, `build-awwwards-quality-sites`) only on explicit marketing triggers.

**Don't**

- Do not apply this look to the product PWA or salon app pages.
- Do not drift to orange/peach accents from `layout-ref.jpg`.
- Do not use Design 2 teal, busy badges, or slot-grid imagery.
- Do not use Unsplash photos, glassmorphism, neon glow, or generic English class-landing copy.
- Do not put stats pills, icon strips, or feature cards in the first viewport.
- Do not invent colors outside this file — extend tokens here first.
