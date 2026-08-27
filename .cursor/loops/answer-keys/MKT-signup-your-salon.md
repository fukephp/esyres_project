# Answer key: MKT-signup-your-salon

> Marketing Design 1 waitlist page. Not an MVP story from `docs/mvp/07-Stories.md`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/MKT-signup-your-salon.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | MKT-signup-your-salon |
| Source | Chat: “Sign up your salon” page; `refs/design-1/DESIGN.md`. Code: `esyres_app/marketing/`. Product constraint: invite-only owners (`docs/mvp/03-Key-Features.md`). |
| Goal (one sentence) | Ship a minimal Design 1 waitlist page at `/signup.html` and wire homepage “Sign up your salon” CTAs to it (interest only; Formspree placeholder). |
| Branch name | `marketing/signup-your-salon` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-27 |

## Pass/fail — product

- [x] `signup.html` exists as a Vite multi-page entry (or equivalent) and is included in `npm run build` output — verify: `esyres_app/marketing/dist/signup.html` (or built asset path) present after `npm run build`
- [x] Page IA is minimal: nav + hero (H1 + support) + waitlist form + short invite-only note + dark footer; no how-it-works / feature grid / FAQ on this page — verify: structure in `signup.html`; `npm run build` exits 0
- [x] Form fields: salon name, owner name, email (required); phone optional; `method="POST"` with Formspree-style `action` using a clearly marked placeholder (e.g. `REPLACE_ME` / `PLACEHOLDER`) plus HTML comment or README note to replace before go-live — verify: grep/`signup.html` inspection; `npm run build` exits 0
- [x] Homepage nav, hero, and footer primary “Sign up your salon” controls are enabled links to `/signup.html` (not disabled buttons) — verify: `index.html` links; `npm run build` exits 0
- [ ] Design 1 Cal look (white canvas, black primary, Cal Sans + Inter, dark footer); copy English and honest about invite-only / waitlist (no claim of instant owner account) — verify: human-only: PR screenshots desktop+mobile of `/signup.html` (+ homepage CTA link)

## Pass/fail — architecture

- [x] Change only `esyres_app/marketing/` (plus this key / map). Do not touch product PWA, Laravel, or Design 2 — verify: git diff paths
- [x] Stay static HTML/CSS/JS; Vite-only; no new npm deps; no Sanctum / GraphQL / owner auth — verify: `package.json`; `npm run build` in `esyres_app/marketing` exits 0
- [x] Does not implement public owner registration in the product (MVP invite-only) — verify: no Laravel/PWA owner signup routes in the diff

## Verify commands

Run from `esyres_app/marketing/`:

```text
npm run build
```

## Out of scope

- Live Formspree form id (placeholder only; human replaces later)
- Real owner accounts, invites, Sanctum, Laravel APIs
- Product PWA / Design 2
- Pricing page, Bosnian marketing copy
- GSAP / Awwwards polish
- How-it-works / benefits / FAQ sections on this page
- Hosting / DNS

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `refs/design-1/DESIGN.md`. Reuse homepage tokens/components from `esyres_app/marketing/` (`style.css`, nav/footer patterns).
2. Add `signup.html` (Vite MPA: ensure it is a root HTML entry so build emits it — mirror how `index.html` is set up; adjust `vite.config` only if required for multi-page).
3. Page structure: top nav (brand → home; primary CTA may be current page or muted); hero with H1 + one support line (invite-only waitlist tone); form in a calm card/surface; short invite-only note; dark footer. No product mock required on this page unless it stays subordinate to the form (prefer form as the focus — no hero mock competing).
4. Form: `salon_name`, `owner_name`, `email` required; `phone` optional. Labels in English. `action` = Formspree URL with obvious placeholder; HTML comment + one-line note in `esyres_app/marketing/README.md` (create short README if missing) explaining replace-before-go-live. Client-validate required fields. With placeholder id: do **not** fake a successful waitlist join — honest “Formspree not connected” (or equivalent) if submit is intercepted; do not claim account creation.
5. Update `index.html`: replace disabled nav/hero/footer “Sign up your salon” buttons with links to `/signup.html` (or `signup.html` relative as used elsewhere).
6. Match Design 1: Cal Sans display, Inter body, black CTAs, hairlines, dark footer only as dark band. English copy only.
7. Loop: implement → `npm run build` → fix. Cap 8; stop on twice-same-fail.
8. On success: PR linking this key; embed desktop + mobile screenshots of signup page (and briefly homepage CTA). Do not commit shot files. Draft/blocked if shots cannot attach.
9. After PR: Bugbot; nits on same PR. Do not silently change this key.
