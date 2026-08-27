# Story map: MKT-signup-your-salon

> Wayfinder-lite planning artifact.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|-------|
| Story ID | MKT-signup-your-salon |
| Source | Chat: marketing page “Sign up your salon”; Design 1 `refs/design-1/DESIGN.md`. Not an MVP story from `docs/mvp/07-Stories.md` (MVP has no public owner signup). Prior MKT keys: `.cursor/loops/answer-keys/MKT-*.md`. Code: `esyres_app/marketing/`. |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/MKT-signup-your-salon.md` |

## Destination

A Design 1 marketing **interest waitlist** page for salon owners (“Sign up your salon”): collect interest only — no owner account created. Linked from homepage primary CTAs; matches `refs/design-1/DESIGN.md`; ships via `npm run build` in `esyres_app/marketing/`.

## Notes

- Product truth: owner onboarding is **invite-only / founder-provisioned** — “No public Register salon” (`docs/mvp/03-Key-Features.md`). Homepage footer already says invite-only.
- Surface: Design 1 marketing only — not PWA `/owner`, not Design 2.
- Verify available today: `npm run build` from `esyres_app/marketing/` (same as prior MKT keys). Laravel/PWA still placeholder — do not implement product auth.
- Skills later: Design 1 + optional landing-page techniques; stay Cal SaaS, not Awwwards unless asked.
- Standing preferences for this effort:
  - English marketing copy until localization (Design 1)
  - Static HTML/CSS/JS, Vite-only, no new deps unless decided

## Decisions so far

- Story is **marketing** (Design 1), not product owner registration in the PWA.
- Unit of work: one page PR under `esyres_app/marketing/`.
- Visual system: `refs/design-1/DESIGN.md` (white canvas, black CTAs, Cal Sans + Inter, dark footer).
- **Page purpose:** interest waitlist form (collect salon interest/contact). No public owner account creation.
- **URL + wiring:** page at `/signup.html`; enable homepage nav, hero, and footer primary CTAs as links to it.
- **Form:** fields = salon name, owner name, email, phone (optional). Submit via Formspree (no Laravel).
- **Formspree endpoint:** placeholder `action` in HTML + short comment/README note; replace with real form id before go-live. Live delivery not a machine verify gate.
- **Page IA:** minimal conversion — nav + hero (H1/support) + waitlist form + short invite-only note + dark footer. No how-it-works / benefits / FAQ on this page.
- **Copy / SEO:** English; invite-only waitlist framing. Title ~`Sign up your salon · Esyres`. Implementer drafts H1/support consistent with homepage footer tone.
- **Success UX:** client-validate required fields. With placeholder Formspree id: do not fake a successful signup — show an honest “not connected yet” (or equivalent) state. When real id is set later, Formspree submit + inline thank-you is the target (out of band for this PR’s machine gate).
- **Responsive:** Design 1 defaults (stack on mobile; no special layout story).

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Real owner account creation, Sanctum, invite tokens, Laravel APIs
- Product PWA routes / Design 2
- Pricing page
- Bosnian localization of marketing
- GSAP / Awwwards polish unless separately requested
- Hosting / DNS
- Wiring a live Formspree form id (human replaces placeholder later)
- Longer owner landing sections (how-it-works / FAQ)
