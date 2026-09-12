# STORY-45 — Guest column: nav and main align

| Field | Value |
|-------|--------|
| ID | STORY-45 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | STORY-43, STORY-44 |

## User story

As a guest, I want the top-nav and the page content to share one width on public pages, so that the logo and the main column line up.

## Acceptance criteria

- Guest routes `/`, `/salons`, `/salon/:id`, `/create-salon`, `/bookings`: one inner column ~1200px (Design 1) with the same horizontal padding as today’s top-nav (`px-5` / `md:px-16`). The top-nav inner row and guest `main` share that measure and `mx-auto` centering. Logo left edge = main left edge. The bar hairline stays full-bleed. Not sticky.
- On `/`, the homepage content wrapper (hero + footer) is that column, not only the `<main>` tag. h1 spans the column. Support + how-it-works stay existing `max-w-xl`, left-aligned. AuthShell stays `max-w-sm` left. Pronađi salon stays `w-fit`. Footer stays in the column. The `.homepage` class stays `/` only (min-height footer flex). Do not copy `.homepage` onto other routes.
- `/salons`: heading, chips, search, teaser cards, results rows, and show-all span the column. Keep today’s 1-col stack (no desktop 3-up teaser). STORY-44 facts and filter/teaser behavior unchanged.
- `/salon/:id` (including after `GET /qr/{id}` 302): name, busy, hours, and services span the column. Picker, chat, and full-width CTAs (`Pošalji zahtjev`, chat alternate) stay a left-aligned form measure (~`max-w-md`). No two-column salon and no right schedule rail. Still never show the homepage (hero + footer + homepage slot).
- `/create-salon`: `main` uses the guest column; AuthShell, email-verify, and the name form stay a left-aligned form measure. Empty top-nav slot unchanged.
- `/bookings`: `main` uses the guest column; list and headings span; logged-out AuthShell stays a left-aligned form measure.
- Nested `mx-auto max-w-md` (or `max-w-3xl` on `/`) as the **page** measure on guest `main` is gone. Local max-widths on copy and forms stay left-aligned, not a second centered page.
- `/owner*` overlay: top-nav inner stays unconstrained (padding only, no guest max-width). Queue, aside, OwnerNav, and 15-minute grid unchanged.
- Patch `refs/design-1/DESIGN.md` layout notes: guest nav inner + main share ~1200px; owner nav inner unconstrained. Sparse still means no homepage hero/footer on other routes — not a 448px page.

## Out of scope

- Owner panel / aside layout, OwnerNav, or constraining the owner bar inner
- Sticky top-nav
- Discovery 3-up card grid
- Two-column salon or a right schedule rail
- New Bosnian copy
- Changing STORY-44 filter, teaser counts, or result facts
- Public pricing page
- Awwwards / GSAP / Three.js
