---
version: alpha
name: Esyres Design 2
description: >-
  Design 2 — Esyres pastel pack (homepage on `/`, discovery, salon, owner).
  Direction adapted from the Intelly HealthCare dashboard
  (https://dribbble.com/shots/23902200-Intelly-HealthCare-App-Dashboard):
  cream canvas, black owner icon rail, pastel status cards, big display greeting.
  Supersedes Design 1 Cal (ADR 0039).
colors:
  page: "#FAF4EA"
  canvas: "#FFFCF6"
  surface-soft: "#F4EDE2"
  surface-card: "#EFE7DA"
  ink: "#111111"
  body: "#3F3A33"
  muted: "#7A7266"
  hairline: "#E8DECE"
  primary: "#111111"
  primary-active: "#242424"
  surface-dark: "#0E0E0E"
  surface-dark-elevated: "#1C1C1C"
  on-dark: "#FFFFFF"
  on-dark-soft: "#A1A1AA"
  pastel-pink: "#F5B8DB"
  pastel-green: "#9AAB63"
  pastel-blue: "#B6CAEB"
  pastel-yellow: "#F5D867"
  status-pending: "{colors.pastel-pink}"
  status-proposed: "{colors.pastel-blue}"
  status-confirmed: "{colors.pastel-yellow}"
  status-done: "{colors.surface-card}"
  error-strong: "#DC2626"
  error-strong-active: "#B91C1C"
  busy-free: "#22C55E"
  busy-moderate: "#EAB308"
  busy-busy: "#EF4444"
typography:
  display-xl: { fontFamily: "Bricolage Grotesque, Manrope, sans-serif", fontSize: 64px, fontWeight: 600, lineHeight: 1.0, letterSpacing: -2px }
  display-lg: { fontFamily: "Bricolage Grotesque, Manrope, sans-serif", fontSize: 44px, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5px }
  display-md: { fontFamily: "Bricolage Grotesque, Manrope, sans-serif", fontSize: 32px, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1px }
  display-sm: { fontFamily: "Bricolage Grotesque, Manrope, sans-serif", fontSize: 22px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5px }
  body: { fontFamily: "Manrope, sans-serif", fontSize: 15px, fontWeight: 400, lineHeight: 1.5 }
  body-strong: { fontFamily: "Manrope, sans-serif", fontSize: 15px, fontWeight: 600, lineHeight: 1.4 }
  micro: { fontFamily: "Manrope, sans-serif", fontSize: 11px, fontWeight: 600, letterSpacing: 0.08em, textTransform: uppercase }
rounded:
  card: 16px
  panel: 24px
  pill: 9999px
---

# Design 2 — pastel pack

One pack for every PWA surface. Product UX still comes from `docs/mvp/04-UI-Design-Goals.md` and `.cursor/rules/frontend/` (sparse customer, dense owner). Wireframes: [`wireframes.md`](wireframes.md).

## Principles

1. **Cream, not white.** `page` is the body background; `canvas` (warm white) is cards, inputs, and dialogs. Hairlines are warm (`hairline`).
2. **Color carries meaning.** Pastels map to booking status on owner surfaces; they are not decoration on guest forms.
3. **One black primary.** Primary CTAs stay a black pill (`primary`, press `primary-active` + `scale-[0.98]`). Pink is a secondary highlight (chips, selected day, brand mark), never a second primary.
4. **Big, friendly display type.** Bricolage Grotesque for H1/H2 and greeting; Manrope for everything else; `micro` for small uppercase labels (column heads, weekday heads).
5. **Soft blocks.** Cards `rounded-2xl` (16px) on `surface-card` or a status pastel; panels `rounded-3xl` (24px). No heavy shadows.

## Status mapping (owner)

| Status | Token | Use |
|--------|-------|-----|
| `requested` (incl. reschedule overlay) | `status-pending` pink | Zahtjevi pile, Kanban column 1 |
| `time_proposed` | `status-proposed` blue | Week-grid card, Kanban column 2 |
| `confirmed` (upcoming) | `status-confirmed` yellow | Week-grid card, Kanban column 3 |
| `declined`, `cancelled`, past `confirmed` | `status-done` | Kanban column 4, muted |

Worker dots keep stable per-worker colors (`workerDotColor`) and sit inside the card as a small dot. Guest busy badge keeps 🟢/🟡/🔴 (`busy-*`), never the pastels.

## Fonts

Self-hosted via Fontsource (OFL): `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/manrope`. Tailwind `--font-display` / `--font-sans`. Cal Sans is removed.

## Components

| Component | Spec |
|-----------|------|
| `OwnerShell` | `md+`: black rail (`surface-dark`, `on-dark`). Collapsed (`md:w-16`, default when this browser has nothing saved): brand mark → `/` (no wordmark), pastel-pink collapse circle under the mark (**Proširi izbornik**, chevron right), outline icons (Zahtjevi calendar, Zapisi list, Chats speech bubble + count badge, Statistika bar chart, Saloni shop, Postavke gear), active link = `canvas` pill, icon Odjava at the bottom (`error-strong`, exit icon). Expanded (`md:w-60`): mark plus the Esyres wordmark, the same pink circle on that top row (**Sklopi izbornik**, chevron left), those labels, and Odjava with the word Odjava. This browser remembers (`esyres.ownerRail`). Main column on `page`: header row with display greeting `Dobrodošli, {ime}` (or page title when no name), salon switcher or salon name before the optional action slot (e.g. Telefon). Phone: no rail and no toggle; compact header (brand + salon + Statistika text link + text Odjava) and a fixed bottom tab bar of the same five icons (no visible labels; Chats keeps the count) on `surface-dark`. |
| `SegmentedToggle` | Pill group on `surface-card`; selected segment `ink` fill + `canvas` text. Used for Prikaz (Kalendar / Kanban) and week/day switch. |
| `StatusCard` | `rounded-2xl` pastel fill by status, `p-3`; top line time (`tabular-nums`, 600), then customer or service name (600), then meta (`muted`, worker dot + name). Whole card is a link to Request Detail unless it carries actions. Confirmed Zahtjevi cards add a bottom ink progress track (elapsed share of the occupied range, soft track, no percent). Zapisi cards do not. |
| `WeekGrid` | `md+`: 7 day columns (`micro` weekday + date head; selected day `pastel-pink` head, today ink underline). Cards stacked by start time per column (no pixel-exact clock placement, no now-line, no drag). Chevrons shift a week. Phone: day chips row (7) + the selected day column only. |
| `KanbanBoard` | 4 columns on `md+` (`grid-cols-4`), horizontally scrollable snap columns on phone. Column head: `micro` label + count pill. Column 1 cards carry Prihvati / Predloži / Odbij (same rules as today). |
| `DayChips` | 7 pills for the visible week (weekday + date), selected = `ink` fill. |
| `SalonCard` | Homepage strip: `rounded-2xl` `surface-card`, salon name (display-sm), address (`muted`), busy badge for today. Links to `/salon/:id`. No photos. |
| `StepCard` | Pastel block with a number chip, a short title, one line of copy. |
| `AudienceCard` | Large `rounded-3xl` block, pink (Za goste) or blue (Za salone), title + 2 bullets + CTA. |
| `FaqItem` | Native `<details>` on `canvas`, `rounded-2xl`, hairline. |
| `Skeleton` | Loading stand-in shaped like the content (rows, cards, tiles, pills, week grid). Blocks `surface-card` (on the dark shell `surface-dark-elevated`), radius of the thing they replace, `motion-safe:animate-pulse`, no shadow or pastel. Hidden until ~150ms. Wrapper `role="status"` + `aria-busy`, sr-only `Učitavanje…`. Owner routes load inside a ghost `OwnerShell` (no links). |

## Surfaces

- **Homepage `/`**: shared top-nav → split hero (H1 + support + Pronađi salon left; static pastel Zahtjevi mock right on `md+`, below on phone) → Kako radi (3 `StepCard`) → Za goste / Za salone (`AudienceCard`) → Popularno u Sarajevu (`SalonCard` strip from `popularInSarajevo`) → FAQ → footer (dark `surface-dark` block with city line and links). Auth open still hides everything below the nav.
- **Guest routes** (`/salons`, `/salon/:id`, `/create-salon`, `/bookings`): re-skin only (tokens, radii, type). Structure stays per CONTEXT (day-gated send, empty `md+` aside, no photo cards on discovery).
- **Owner routes**: all inside `OwnerShell`. Zahtjevi and Zapisi render the owner's **Prikaz** (`calendar` default, `kanban`). Other owner pages keep their content in `rounded-3xl canvas` panels.

## Do / don't

- Do keep one-tap Prihvati on pending cards in both templates.
- Do keep `?salon=` and the Telefon modal on Zahtjevi.
- Don't add drag, a now-line, or a 15-minute board.
- Don't use pastels for guest busy level or for error states.
- Don't add GSAP/Three.js or 3D blobs (the Dribbble shots' inflatables are marketing art, not product UI).
