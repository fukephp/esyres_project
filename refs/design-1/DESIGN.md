---
version: alpha
name: Esyres Marketing Landing
description: >-
  Design 1 — Esyres-the-company marketing site (landing, later pricing).
  Visual system adapted from Cal.com DESIGN.md (https://www.designmd.co/d/cal):
  white canvas, black primary CTAs, Cal Sans + Inter, soft ~12px cards,
  product UI fragments in-card, dark footer. Do not apply to the product PWA.
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

Design 1 is the **Esyres-the-company marketing site** — landing first, pricing later. Implementation lives in [`esyres_app/marketing/`](../../esyres_app/marketing/) (Vite + HTML/CSS), sibling under the Laravel root — not under `public/`, not in the PWA bundle.

**Provenance:** Visual system adapted from [Cal.com DESIGN.md on designmd.co](https://www.designmd.co/d/cal). Tokens, type roles, radius, whitespace, in-card product UI, and dark footer follow that system. Product framing and page IA are Esyres-specific.

The surface is clean modern SaaS — white canvas (`{colors.canvas}`), black primary CTAs (`{colors.primary}`), **Cal Sans** display + **Inter** body, `{colors.surface-card}` (#f5f5f5) cards holding **static HTML/CSS product UI mocks** of the Esyres request flow (guest picks day → owner proposes time → guest confirms). Brand voltage comes from Cal Sans headlines and monochrome product chrome in-card — not illustration, not accent color.

Copy for this marketing site is **English** until localization lands. Do not invent Bosnian strings in Design 1 files for this phase.

**Do not apply Design 1 to the product PWA.**

### Locked marketing IA

1. **Top nav** — logo/wordmark left; links + primary CTA right.
2. **Hero** — H1 + support + CTAs left; request-flow mock in `{component.hero-app-mockup-card}` right.
3. **How it works** — three steps (day → propose → confirm) with monochrome product-UI-in-card.
4. **Why Esyres** — short 2–3 feature cards on `{colors.surface-card}`.
5. **Dark footer** — contact + secondary CTA on `{colors.surface-dark}`.

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
- **Surface dark** (#101010): Footer only (scarce dark signal).
- **Hairline** (#e5e7eb): 1px borders on light surfaces.

### Text

- **Ink** (#111111), **Body** (#374151), **Muted** (#6b7280), **Muted soft** (#898989).
- **On primary / on dark** (#ffffff); **On dark soft** (#a1a1aa) for footer body.

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

- Max content width ~1200px; section vertical rhythm `{spacing.section}` (96px).
- Hero: ~7/5 split (copy | mock) on desktop; stack on mobile.
- Feature grids: 3-up desktop → 1-up mobile.
- Safe margins: ~48–64px desktop, ~20–24px mobile.
- First viewport: brand **Esyres** + one H1 + one support line + one CTA group + one dominant request-flow mock. No stats strip, no floating badges on the mock.

## Elevation & Depth

Flat white bands; soft hairline borders; card surfaces via `{colors.surface-card}` (prefer color block over heavy shadow). Hero mock may use a faint drop (`0 1px 2px rgba(0,0,0,0.05)` / `0 4px 12px rgba(0,0,0,0.08)`). No glassmorphism, glow stacks, or neumorphism.

## Shapes

Radius hierarchy: buttons/inputs `{rounded.md}` (8px); content cards `{rounded.lg}` (12px); hero mock `{rounded.xl}` (16px); pills/avatars full. Do not exceed 16px on cards.

## Components

**Primary button** — #111111 fill, white label, 8px radius, 40px height. Disabled uses `{colors.primary-disabled}`.

**Secondary button** — white fill, ink text, 1px hairline.

**Top nav** — 64px, canvas background, logo left, links + CTA right.

**Hero mock / product mockup card** — white or light card with hairline; contains static monochrome HTML/CSS of day pick → time propose → confirm. English labels in mocks for this phase.

**Feature card** — `{colors.surface-card}`, 12px radius, 32px padding; title + short body.

**Footer** — `{colors.surface-dark}`; only dark surface on the page.

## Do's and Don'ts

**Do**

- Read this file (and the Cal provenance URL) before generating marketing UI.
- Keep English marketing copy until localization; Esyres offer: day-level request, owner proposes time, guest confirms.
- Embed product UI mocks in cards; keep mocks monochrome Cal chrome.
- End pages with the dark footer.
- Use gated skills (`landing-page`, `pricing-page`, `build-awwwards-quality-sites`) only on explicit marketing triggers.

**Don't**

- Do not apply this look to the product PWA or salon app pages.
- Do not use pixel art, isometric salon illustrations, magenta/cobalt palettes, mega-bento shells, or screenshot JPG refs.
- Do not use Unsplash photos, glassmorphism, neon glow, or Cal.com “schedule meetings” copy.
- Do not put accent blue or badge pastels on primary CTAs.
- Do not invent colors outside this file — extend tokens here first.
- Do not put stats pills or feature cards in the first viewport.

## Responsive

- Mobile &lt; 768px: hero stacks; h1 scales down (~32px); grids 1-up; nav may collapse.
- Tablet 768–1024px: feature cards 2-up.
- Desktop ≥ 1024px: full nav; 3-up features; hero 7/5.
- Wide &gt; 1440px: same layout, more outer margin; content max 1200px.
