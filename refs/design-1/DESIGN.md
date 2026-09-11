---
version: alpha
name: Esyres Marketing Landing
description: >-
  Design 1 — Esyres Cal pack (homepage on `/`, discovery, salon, owner).
  Visual system adapted from Cal.com DESIGN.md (https://www.designmd.co/d/cal):
  white canvas, black primary CTAs, Cal Sans + Inter, soft ~12px cards.
  Homepage IA stays on `/` only; owner stays a dense panel.
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
  badge-orange: "#fb923c"
  badge-pink: "#ec4899"
  badge-violet: "#8b5cf6"
  badge-emerald: "#34d399"
typography:
  display-xl:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -2px
  display-lg:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.5px
  display-md:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1px
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
  section: 96px
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
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 64px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: 96px
  hero-app-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  product-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: 64px
---

## Overview

Design 1 is the **only Cal pack** — homepage on `/`, discovery, salon, and owner. Implementation lives in [`esyres_app/frontend/`](../../esyres_app/frontend/). There is no sibling `esyres_app/marketing/` site.

**Provenance:** Visual system adapted from [Cal.com DESIGN.md on designmd.co](https://www.designmd.co/d/cal). Tokens, type roles, radius, and whitespace follow that system. Product framing and page IA are Esyres-specific.

The surface is clean modern SaaS — white canvas (`{colors.canvas}`), black primary CTAs (`{colors.primary}`), **Cal Sans** display + **Inter** body. Brand voltage comes from Cal Sans headlines and monochrome chrome — not illustration, not accent color.

Copy is **Bosnian-first**, same as the rest of the PWA.

**Homepage IA stays on `/` only.** Discovery and salon stay sparse customer. `/owner` keeps dense queue + 15-minute grid with Cal light chrome (no dark nav). Busy/cell tokens move here in STORY-42.

### Locked homepage IA

Short scroll:

1. **Header** — logo, Prijava/Registracija, Get your panel (or Panel). Homepage only.
2. **Hero** — existing H1 + support + three how-it-works lines + Pronađi salon → `/salons`.
3. **Simple footer** — Sarajevo + one line. No dark footer, Terms, Privacy, Instagram, or language toggle.

No feature grid, in-card product mock, or long-scroll SaaS landing. `/create-salon` is a sparse form (brand link home), not this header/footer.

No pixel art, no mega-bento shells, no screenshot JPG refs, no icon-strip carousels.

## Colors

### Brand & Accent

- **Primary** (`{colors.primary}` — #111111): Primary CTAs and display type. Press → `{colors.primary-active}` (#242424).
- **Brand Accent** (`{colors.brand-accent}` — #3b82f6): Spare use only (rare inline link). Never on hero CTAs.
- **Badge pastels** — optional small accents inside product UI mocks only; never primary chrome.

### Surface

- **Canvas** (#ffffff): Page floor.
- **Surface soft** (#f8f9fa): Soft dividers.
- **Surface card** (#f5f5f5): Feature cards, mock internals.
- **Surface dark** (#101010): unused on the MVP company pitch (no dark footer).
- **Hairline** (#e5e7eb): 1px borders on light surfaces.

### Text

- **Ink** (#111111), **Body** (#374151), **Muted** (#6b7280), **Muted soft** (#898989).
- **On primary / on dark** (#ffffff); **On dark soft** (#a1a1aa) reserved if a later Design 1 surface needs dark text.

## Typography

**Cal Sans** for display + wordmark (weight 600, negative letter-spacing). **Inter** for body, buttons, nav, captions. Never put body in Cal Sans; never put display headlines in Inter. Display weight stays 600.

Self-host Cal Sans from the Cal.com font repo. Load Inter via CDN or self-host. If Cal Sans is unavailable, Inter 600 with ≈ -0.04em tracking is the fallback.

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| display-xl | 64px | 600 | -2px | Homepage h1 |
| display-lg | 48px | 600 | -1.5px | Section heads |
| display-md | 36px | 600 | -1px | Sub-heads |
| display-sm | 28px | 600 | -0.5px | Footer CTA heads |
| title-md / title-sm | 18 / 16px | 600 | 0 | Card titles (Inter) |
| body-md / body-sm | 16 / 14px | 400 | 0 | Running text |
| button / nav-link | 14px | 600 / 500 | 0 | UI chrome |

## Layout

- Max content width ~1200px; `/` is a short scroll (header + hero + footer), not a long-scroll of `{spacing.section}` bands.
- Stack on mobile; modest two-column only if the three how-it-works lines need it on desktop.
- Safe margins: ~48–64px desktop, ~20–24px mobile.
- First viewport: brand **Esyres** + homepage header + one H1 + one support line + three how-it-works lines + Pronađi salon. No stats strip, no mock.

## Elevation & Depth

Flat white bands; soft hairline borders; card surfaces via `{colors.surface-card}` (prefer color block over heavy shadow). Hero mock may use a faint drop (`0 1px 2px rgba(0,0,0,0.05)` / `0 4px 12px rgba(0,0,0,0.08)`). No glassmorphism, glow stacks, or neumorphism.

## Shapes

Radius hierarchy: buttons/inputs `{rounded.md}` (8px); content cards `{rounded.lg}` (12px); hero mock `{rounded.xl}` (16px); pills/avatars full. Do not exceed 16px on cards.

## Components

**Primary button** — #111111 fill, white label, 8px radius, 40px height. Disabled uses `{colors.primary-disabled}`.

**Secondary button** — white fill, ink text, 1px hairline.

**Top nav** — homepage only: wordmark, Prijava/Registracija, Get your panel / Panel. Not on `/salons` or `/salon/:id`.

**Hero mock / product mockup card** — not used on the MVP homepage.

**Feature card** — not used on the MVP homepage.

**Footer** — simple light footer on `/` only (Sarajevo + one line). No dark page ending.

## Do's and Don'ts

**Do**

- Read this file (and the Cal provenance URL) before generating homepage or product chrome.
- Keep Bosnian-first copy; Esyres offer: guest picks preferred day and time, owner accepts or adjusts, guest confirms when counter-proposed.
- Use gated skills (`landing-page`) only on explicit homepage / Esyres-landing triggers. `pricing-page` is unused (no public pricing). `build-awwwards-quality-sites` only if the user asks for homepage polish.

**Don't**

- Do not turn discovery, salon, or `/owner` into homepage hero/footer IA.
- Do not scaffold `esyres_app/marketing/` or a second Vite app.
- Do not use pixel art, isometric salon illustrations, magenta/cobalt palettes, mega-bento shells, or screenshot JPG refs.
- Do not use Unsplash photos, glassmorphism, neon glow, or Cal.com “schedule meetings” copy.
- Do not put accent blue or badge pastels on primary CTAs.
- Do not invent colors outside this file — extend tokens here first.
- Do not put a feature grid, product mock, owner waitlist CTA, login wall, or dark footer on the pitch.
- Do not ship a long-scroll company site.

## Responsive

- Mobile &lt; 768px: stack; h1 scales down (~32px).
- Tablet 768–1024px: still one column.
- Desktop ≥ 1024px: one screen; no 3-up feature row.
- Wide &gt; 1440px: same layout, more outer margin; content max 1200px.
