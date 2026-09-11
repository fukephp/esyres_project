# Story map: STORY-39

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-39 |
| Source | `docs/stories/STORY-39.md` |
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-39.md` (after compile) |

## Destination

A guest who typed `/` sees one Bosnian Design 1 company-pitch screen, taps one CTA, then sees today’s discovery home on the same `/`. `esyres_app/marketing/` is gone. QR and `/salon/:id` never show the pitch.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-39.md`, `docs/adr/0024-company-pitch-in-pwa.md`, `docs/glossary.md` (**Company pitch**, **Discovery home**), `docs/mvp/` (01, 03, 04, 06), `docs/architecture/` (01, 04, 07, 08), `DESIGN.md`, `refs/design-1/DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists; subroutine — no diverge); custom-feature-skills; playbook plan-gate until this map compiles. Do not run `landing-page` unless the user explicitly asks for pitch copy/layout beyond this story.
- Code today (`esyres_app/`): `/` mounts `DiscoveryHome` immediately (`useGeo` on mount). No pitch component, no `localStorage`. `esyres_app/marketing/` still exists (English long-scroll + owner waitlist). README/CONTEXT already dropped the marketing `build`. Laravel `GET /qr/{salon}` 302s to `/salon/:id` (missing salon → `SpaUrl::home()`). Catch-all `*` → `/`. Vitest is helper-only (no RTL/Playwright this PR).
- Story AC: one-screen pitch; persist “seen” in the browser; auth does not skip; discovery/geo unmounted until CTA or stored seen; delete marketing; no `/welcome` / `/salons`.
- Standing preferences:
  - One story → one PR; do not rewrite historical `MKT-*` keys
  - Do not invent a second Vite app or restore `marketing/`
  - Design 1 only on the pitch; Design 2 after the CTA
  - Protect QR / IG-bio → salon → request (pitch never sits in front of those)
  - Behat flags CLI-only; frontend typecheck/test/build; no Playwright, Pest, codegen this PR

## Decisions so far

- **Placement (docs/ADR 0024):** Company pitch is in the React PWA on the same `/` as discovery. No `/welcome`, no `/salons`, no sibling marketing site.
- **IA (Design 1 + STORY-39):** One viewport: brand **Esyres** + H1 + one support line + three how-it-works lines (pick day and preferred time; salon accepts or adjusts; you confirm only when they propose a different time) + one guest CTA. No marketing link row, long-scroll, feature grid, dark footer, product mock, owner CTA, login/register, or second CTA.
- **Chrome (Design 1):** Optional top-nav is wordmark-only. First viewport includes the Esyres brand. No owner waitlist / Formspree / `/invite`.
- **Look (Design 1):** White canvas, black primary CTA, Cal Sans display + Inter body. Self-host Cal Sans into `esyres_app/frontend/` (Inter 600 / −0.04em fallback if the font file is missing). After CTA, discovery stays Design 2 as today. Do not apply Design 1 composition to salon or `/owner`.
- **Gate:** Auth/session does not skip the pitch. Clearing site data shows it again. Discovery home (and `navigator.geolocation`) must not mount until the CTA or stored “seen”. Read “seen” synchronously before paint (no pitch→list flash).
- **Other routes:** `/salon/:id` never renders the pitch. `GET /qr/{id}` never renders the pitch (Laravel 302 only). Catch-all `*` stays `Navigate` to `/` (then the same gate).
- **Delete:** Remove `esyres_app/marketing/`. Local verify stays the README list (no marketing `build`). Move any pitch assets (mark, Cal Sans) into the PWA first.
- **Stack:** Existing Vite React PWA, i18next `bs`, React Router, Vitest helpers. No Playwright, RTL, Pest, GraphQL codegen, or new REST this PR.
- **Out of inventory:** Do not rewrite historical `MKT-*` loop keys. Do not strip stale marketing verify lines from old keys in this PR unless a file this story already touches.

## Open decisions

- **Copy:** Exact Bosnian H1, support line, three how-it-works lines, and guest CTA label (meaning is locked; strings are not).
- **Seen storage:** Browser API + key + value used for “seen” (must survive reload; must vanish when the guest clears site data; must not be the Sanctum session).
- **Unknown QR → `/`:** Missing-salon `GET /qr/{id}` currently 302s to `SpaUrl::home()` (`/`). After this story that URL is the pitch gate. Keep that 302, or send unknown QR somewhere that never hits the pitch?

## Not yet specified

<!-- empty — remaining product questions are in Open decisions -->

## Out of scope

- Owner waitlist, Formspree, `/invite`, public owner signup
- Public pricing page
- Awwwards / GSAP / Three.js
- Moving discovery to a new path
- Login or register on the company pitch
- Design 1 on salon profile or `/owner`
- Rewriting historical `MKT-*` loop keys
- Language switcher; English pitch
- Playwright, Pest, GraphQL codegen, `vite-plugin-pwa` work this PR
