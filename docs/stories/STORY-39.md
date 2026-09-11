# STORY-39 — Company pitch on `/`

| Field | Value |
|-------|--------|
| ID | STORY-39 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-39` |
| Depends on | STORY-05 |

## User story

As a guest who typed `/`, I want a short Bosnian explanation of Esyres and then the live salon list, so that I can see the product without a separate marketing site.

## Acceptance criteria

- Typed `/` first paint is the company pitch when the guest has not tapped through yet: one Bosnian screen, Design 1 Cal look, hero + three how-it-works lines (pick day and preferred time; salon accepts or adjusts; you confirm only when they propose a different time) + one guest CTA.
- The guest CTA reveals discovery home on the same `/` (no `/welcome`, no `/salons`). Persist “seen” in the browser; later `/` is discovery home. Auth/session does not skip the pitch. Clearing site data shows it again.
- Discovery home (and geolocation) does not mount until the CTA or stored “seen”.
- `/salon/:id` and `GET /qr/{id}` never show the company pitch.
- No long-scroll, feature grid, dark footer, product mock, owner CTA, login wall, or Design 1 composition on salon / `/owner`. After the CTA, discovery is Design 2 as today.
- `esyres_app/marketing/` is gone. Local verify no longer runs a marketing `build`.

## Out of scope

- Owner waitlist, Formspree, `/invite`, public owner signup
- Public pricing page
- Awwwards / GSAP / Three.js
- Moving discovery to a new path
- Login or register on the company pitch
- Design 1 on salon profile or `/owner`
- Rewriting historical `MKT-*` loop keys
