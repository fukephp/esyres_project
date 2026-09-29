# STORY-81 — Homepage sections and guest re-skin

| Field | Value |
|-------|--------|
| ID | STORY-81 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | STORY-77, STORY-40, STORY-44 |

## User story

As a guest or a salon owner landing on `/`, I want to see how Esyres works, who it is for, and a few real salons, so that the homepage feels alive and I know where to tap next.

## Acceptance criteria

- `/` (auth closed), in order: shared top-nav; split hero (H1, support, **Pronađi salon** black pill, and a text link to the panel; on `md+` a static pastel Zahtjevi mock on the right, below the CTA on phone); **Kako radi** (three pastel step cards); **Za goste** / **Za salone** audience cards (Pronađi salon → `/salons`; Otvori panel → same panel href as the top-nav); **Popularno u Sarajevu** (up to four salon cards from `popularInSarajevo`, name + address when set, link `/salon/:id`; hidden when empty; Prikaži sve → `/salons`); **Česta pitanja** (three native `<details>`); dark footer (city + tagline + links Saloni and Panel).
- Auth open still hides everything below the top-nav.
- The static mock is `aria-hidden` decoration with fixed Bosnian sample copy; no live data.
- Guest routes pick up Design 2 via tokens; salon profile and discovery keep structure (day-gated send, empty `md+` aside, photoless discovery).
- All copy Bosnian in `i18n.ts`.

## Out of scope

- GSAP, 3D, photos, pricing, testimonials.
