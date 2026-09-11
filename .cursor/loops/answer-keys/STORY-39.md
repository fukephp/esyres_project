# Answer key: STORY-39

> Epic 1: one-screen Bosnian company pitch on typed `/`, then discovery on the same URL; delete `esyres_app/marketing/`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-39.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-39 |
| Source | `docs/stories/STORY-39.md` — Company pitch on `/` |
| Goal (one sentence) | A guest who typed `/` sees one Bosnian Design 1 pitch once, taps **Pronađi salon**, then sees today’s discovery home on the same `/`; `esyres_app/marketing/` is gone. |
| Branch name | `cursor/story-39-eb9a` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk Hopic / 2026-09-11 |

## Pass/fail — product

- [ ] `shouldShowCompanyPitch(path, seen)` is true only for `/` (or `""`) when `seen` is false; `/salon/:id`, `/bookings`, `/owner`, and any other path are false even when unseen — verify: Vitest
- [ ] `companyPitchSeen` / `markCompanyPitchSeen` use `localStorage` key `esyres.companyPitchSeen` value `1`; missing, empty, or other values are unseen; mark writes `1`; helper does not read cookies or session — verify: Vitest (mock `Storage`)
- [ ] i18n `bs` strings: `pitch.brand` `Esyres`; `pitch.h1` `Rezervacije bez jurnjave za terminom`; `pitch.support` `Odabereš dan i željeno vrijeme. Salon prihvati ili predloži drugo. Potvrdiš samo kad predlože drugačije vrijeme.`; `pitch.step1` `Odaberi dan i željeno vrijeme.`; `pitch.step2` `Salon prihvati ili prilagodi.`; `pitch.step3` `Potvrdiš samo ako predlože drugo vrijeme.`; `pitch.cta` `Pronađi salon` — verify: Vitest
- [ ] `/` first paint with no stored seen renders the pitch only (brand + H1 + support + three steps + one CTA). CTA writes seen and then mounts `DiscoveryHome` on the same `/` (no `/welcome`, no `/salons`, no navigation). `DiscoveryHome` (and `useGeo`) does not mount while the pitch is showing — verify: Vitest of helpers + `App.tsx` `/` element is a gate that renders pitch **or** `DiscoveryHome`, never both
- [ ] `esyres_app/marketing/` does not exist — verify: `test ! -d marketing` from `esyres_app/`
- [ ] One-screen Design 1 Cal look on unseen `/` (white canvas, black CTA, Cal Sans display or Inter 600 fallback); after CTA, discovery is Design 2 as today; `/salon/:id` and `/owner` unchanged — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/01-Overview-and-Stack.md`, `04-Frontend.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md` #36 #41, `docs/adr/0024-company-pitch-in-pwa.md`.

- [ ] Company pitch lives in `esyres_app/frontend/` (one React PWA). No sibling marketing Vite app. No `/welcome`. Verify commands do not run a marketing `build` — verify: `test ! -d marketing`; README/CONTEXT verify lists have no marketing `build`
- [ ] `GET /qr/{id}` stays Laravel 302 (not a React route). Valid salon still 302s to `/salon/:id`. Missing salon still 302s to `SpaUrl::home()` (`/`) with no skip flag. Pitch is never rendered by `QrController` — verify: `QrController` unchanged; existing Behat QR features stay green
- [ ] Design 1 composition (hero + three lines + one guest CTA) is scoped to the pitch surface only. Discovery, salon, `/owner` stay Design 2. i18next `bs` only. No Playwright, RTL, Pest, GraphQL codegen this PR — verify: pitch CSS/class scoped; `esyres_app/frontend/package.json`; no `pestphp`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
test ! -d marketing
```

## Out of scope

- Owner waitlist, Formspree, `/invite`, public owner signup
- Public pricing page
- Awwwards / GSAP / Three.js
- Moving discovery to a new path
- Login or register on the company pitch
- Design 1 on salon profile or `/owner`
- Rewriting historical `MKT-*` loop keys
- Language switcher; English pitch
- Playwright, RTL, Pest, GraphQL codegen, `vite-plugin-pwa` work this PR
- Changing valid-QR 302 to `/salon/:id`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-39.md`, `docs/glossary.md` (**Company pitch**, **Discovery home**), `docs/adr/0024-company-pitch-in-pwa.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: keep `cursor/story-39-eb9a`.
3. **Helpers** (`esyres_app/frontend/src/lib/companyPitch.ts` + `companyPitch.test.ts`): `STORAGE_KEY = 'esyres.companyPitchSeen'`. `companyPitchSeen(storage)` true iff `getItem` is `'1'`. `markCompanyPitchSeen(storage)` `setItem(key, '1')`. `shouldShowCompanyPitch(path, seen)` true only for `/` or `''` when `!seen`. Do not read `document.cookie` or Apollo `me`.
4. **Gate `/`:** Synchronous storage read (not `useEffect`) so first paint is correct. If `shouldShowCompanyPitch`, render pitch only. CTA (`type="button"`) calls `markCompanyPitchSeen(localStorage)` then React state so `DiscoveryHome` mounts on `/` with no `navigate`. Never mount `DiscoveryHome` while showing pitch. No `/welcome` or `/salons` routes. `/salon/:id`, `/bookings`, `/owner*` unchanged. Catch-all `*` still `Navigate` to `/`.
5. **Pitch UI:** One viewport. Wordmark `Esyres` (optional mark copied from `esyres_app/marketing/public/esyres-mark.svg` into `frontend/public/` **before** deleting marketing). H1 + support + three `<li>`/lines + one black primary CTA. No second CTA, login, owner waitlist, feature grid, dark footer, product mock, marketing link row. Copy from i18n keys in the product checks. Informal *ti*. No “Kako radi” heading.
6. **Design 1:** Scope Cal Sans (`@font-face` + a pitch root class) so discovery/salon/`/owner` stay Inter/Design 2. Self-host Cal Sans under `frontend/` if a woff2 is available (Cal.com font repo or the marketing tree before delete); else Inter 600 / −0.04em on the pitch H1 only. White canvas, `#111` CTA, 8px radius, 40px height. Do not change owner/salon composition.
7. **Delete marketing:** After moving mark (and font if present), remove `esyres_app/marketing/` entirely. Patch leftover “Marketing is `marketing/`” in `esyres_app/AGENTS.md` if still present. Do not rewrite historical `MKT-*` keys. Do not add a marketing `build` to verify.
8. **QR:** Do not change `QrController`. Missing salon stays 302 `/`.
9. **Vitest:** Cover every Vitest product check (path gate, storage, i18n literals). Keep `discovery.test.ts` green. No RTL, no Playwright.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
