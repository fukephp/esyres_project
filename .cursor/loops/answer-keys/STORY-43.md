# Answer key: STORY-43

> Epic 1: one shared Cal top-nav (per-route slot) on guest and owner routes. Homepage hero/footer stay on `/` only.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-43.md`, `docs/adr/0029-shared-top-nav.md`, and current PWA chrome.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-43 |
| Source | `docs/stories/STORY-43.md` — Shared Cal top-nav |
| Goal (one sentence) | Every listed route shares one full-bleed Cal top-nav (brand → `/`, native slot only) so `/` keeps the homepage slot+hero+footer and salon/QR never become the company page. |
| Branch name | `cursor/story-43-shared-top-nav-012e` |
| Iteration cap | 8 |
| Status | draft |
| Approved by / date | |

## Pass/fail — product

- [ ] `topNavSlot(path)` is `home` only for `/` and `''`; `discovery` for `/salons` and `/salon/:id`; `empty` for `/create-salon`; `session` for `/bookings` and `/owner` plus `/owner/chats`, `/owner/stats`, `/owner/requests/:id`. `/welcome` and unknown paths are `empty` — verify: Vitest (`esyres_app/frontend/src/lib/homepage.ts`)
- [ ] `topNavChrome(path, me)`: brand is always `{ to: '/', brandKey: 'pitch.brand' }`. `home` + no me → login + register + `ownerPanelCta(false)`. `home` + me → `homepageDisplayName` + logout + `ownerPanelCta(me.salons.length > 0)`. `discovery` → bookings link only (no login/register/panel/name/logout). `empty` → brand only. `session` + me → name + logout (no panel, no bookings link). `session` + no me → brand only — verify: Vitest
- [ ] i18n `bs`: `nav.bookings` is `Moje rezervacije`; `home.getPanel` stays `Imaš salon? Otvori panel`; `home.panel` stays `Panel`; bar Odjava is `home.logout` `Odjava` (not `bookings.logout`). `pitch.*` hero strings and `auth.login` / `auth.register` unchanged — verify: Vitest
- [ ] One `TopNav` component: full-bleed (`w-full`), `bg-canvas text-ink`, hairline bottom (`border-b border-hairline`), `min-h-16` (64px target) + `flex-wrap` (may grow on a narrow phone). No `sticky` / `fixed` on that header. Mark (`/esyres-mark.svg`, 24px) + wordmark is always a `Link` to `/` (self-link on `/`). Slot actions are nav-link text (`text-sm text-body`) except the homepage panel CTA, which is the one black primary (`h-10 rounded-md bg-ink … text-canvas`). No search, cart, mega-menu, social row, hamburger, country selector, or two-row utility bar strings/elements — verify: Vitest reading `TopNav.tsx`
- [ ] `/` uses `TopNav` with the home slot. Guest: Prijava / Registracija open existing `AuthShell` **under** the bar without unmounting hero + Pronađi salon (optional `initialMode`). Logged-in: display name + Odjava + panel button. Panel `Link` uses `ownerPanelCta` (`home.getPanel` → `/create-salon` when no salon; `home.panel` → `/owner` when `me.salons.length > 0`). Visiting `/` never `navigate('/owner')`. Hero + footer stay on this page only, inside the existing constrained column — not inside the full-bleed bar — verify: Vitest reading `Homepage.tsx` + existing `homepageChrome` tests updated for panel CTA
- [ ] `/salons` and `/salon/:id` (QR 302 lands here) share the discovery slot: Moje rezervacije only. In-page `BookingsLink` is gone (`BookingsLink.tsx` deleted). Discovery’s in-page mark+wordmark row is gone (bar owns it). Salon name + busy badge stay in page content, not the bar. No Prijava, Registracija, Get your panel, Panel, name, or Odjava in those page files’ chrome — verify: Vitest reading `DiscoveryHome.tsx` + `SalonProfile.tsx`; `test ! -f frontend/src/components/BookingsLink.tsx`
- [ ] `/create-salon` always empty slot (including loading / AuthShell / verify / name form). Page-local `Brand` duplicate is gone. No homepage hero/footer, no `OwnerNav`, no Get your panel / Panel in the bar — verify: Vitest reading `CreateSalon.tsx`
- [ ] `/bookings`: logged-out (and me-loading) empty slot; AuthShell stays in the page. Logged-in: name + Odjava in the bar; the page-bottom `bookings.logout` button is gone. No Get your panel / Panel. No Moje rezervacije self-link — verify: Vitest reading `MyBookings.tsx`
- [ ] `/owner`, `/owner/chats`, `/owner/stats`, `/owner/requests/:id`: `TopNav` full-bleed **above** the existing aside+main row. Logged-out (and me-loading): empty slot; existing `AuthShell` stays in the page. Logged-in (verify / not-owner / panel): name + Odjava. No Moje rezervacije, no Get your panel / Panel. `OwnerNav`, salon switcher, queue, and 15-minute `WorkerPanel` stay — verify: Vitest reading those four pages + `OwnerNav.tsx`; existing `designPack.test.ts` dense-panel assertions stay green
- [ ] Homepage hero (`pitch.h1` / support / steps / Pronađi salon) and footer (`home.footerCity` / `home.footerLine`) exist only on `Homepage.tsx`. Discovery, salon, create-salon, bookings, and owner files do not import/render that footer or the Pronađi salon CTA — verify: Vitest reading those page files
- [ ] Full-bleed Cal bar is not a second homepage (no catalog nav; salon still shows name+busy in the page) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (shared top-nav, homepage IA on `/` only), `08-Decisions.md` #41 #44, `docs/adr/0029-shared-top-nav.md`, `docs/adr/0027-homepage-not-pitch-gate.md`.

- [ ] One React PWA in `esyres_app/frontend/`. No sibling marketing site. No new GraphQL, REST, or booking mutations. `GET /qr/{id}` stays Laravel 302 to `/salon/:id` — verify: no new schema/feature files this PR; `test ! -d esyres_app/marketing`; `QrController.php` / `SpaUrl.php` unchanged; existing Behat stays green
- [ ] i18next `bs` only. No Playwright, RTL, Pest, GraphQL codegen, or `vite-plugin-pwa` work this PR. Owner chunks stay lazy in `App.tsx` — verify: `esyres_app/frontend/package.json`; `App.tsx` still `lazy()` for owner pages; no `pestphp` require
- [ ] Do not replace `OwnerNav` or restyle discovery/salon as homepage hero/footer. Do not add sticky chrome. Do not put homepage slot CTAs on `/salon/:id` — verify: product checks above + `OwnerNav.tsx` still the aside links

## Verify commands

Run from `esyres_app/` (app root in CONTEXT) unless noted. Stack must be up. Every command must exit 0 before a ready PR.

From **git root**:

```text
test ! -f esyres_app/frontend/src/components/BookingsLink.tsx
test ! -d esyres_app/marketing
```

From **`esyres_app/`** (Compose when Docker is usable; Cloud Agent: if Docker is missing or nested, host PHP + host MySQL like STORY-36 — still `.env.behat` / `esyres_test` only; do not apt-install dockerd; do not `migrate:fresh` or seed `esyres`; do not `compose down -v`; frontend `npm` from `esyres_app/frontend/`):

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Sticky top-nav
- Replacing OwnerNav or other owner IA (queue actions, drag, tap fallback, switcher)
- Search, cart, mega-menu, social row, hamburger, country selector, two-row Poseidon extras
- Moje rezervacije on `/` or `/owner`
- Homepage footer / hero on other routes
- New guest routes
- Public pricing page
- Awwwards / GSAP / Three.js
- Playwright, RTL, Pest, GraphQL codegen, `vite-plugin-pwa`
- Changing `bookings.title` (`Moji zahtjevi`) or `pitch.*` hero copy
- Changing valid-QR 302 to `/salon/:id`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-43.md`, `docs/adr/0029-shared-top-nav.md`, `DESIGN.md`, `refs/design-1/DESIGN.md` (`components.top-nav`), `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run `landing-page` / Awwwards skills.
2. Branch: `cursor/story-43-shared-top-nav-012e`.
3. **Helpers** (`esyres_app/frontend/src/lib/homepage.ts` + tests): add `topNavSlot` / `topNavChrome` as in the product checks. Keep `homepageDisplayName`. Extend or replace `homepageChrome` so the home slot uses `ownerPanelCta` (needs `me.salons`, already on `ME_QUERY`). Reuse `CREATE_SALON_PATH` / `ownerPanelCta` from `createSalon.ts`. Add `isSalonProfilePath`, `isCreateSalonPath`, `isBookingsPath`, `isOwnerPath` (prefix `/owner` including nested).
4. **`TopNav`**: new `esyres_app/frontend/src/components/TopNav.tsx`. Compose it at the **top of each listed page**, including every early-return (loading / auth / verify / not-owner). Do not lift AuthShell into `App.tsx`. Homepage passes login/register/logout handlers; other routes that need logout call `LOGOUT_MUTATION` + refetch `Me` and stay on that route. i18n: `nav.bookings` `Moje rezervacije` for the discovery slot `Link` to `/bookings`.
5. **Homepage:** Pull the bar out of `max-w-3xl` so it is full-bleed; keep hero + footer in the existing constrained column. Wordmark becomes a `Link` to `/`. Panel control is the black primary, copy from `cta.kind === 'panel' ? home.panel : home.getPanel`. AuthShell stays under the bar, hero still mounted. No `navigate('/owner')` on `/`.
6. **Discovery / salon:** Delete `BookingsLink.tsx` and all imports. Remove the in-page brand row on `/salons`. Do not add brand or bookings chrome on the salon page body. Leave salon `<h1>` + busy badge as they are.
7. **Create salon:** Remove local `Brand`. Render `TopNav` with empty slot on loading/auth/verify/form. Do not add OwnerNav or homepage footer.
8. **Bookings:** Render `TopNav`. Remove the bottom `bookings.logout` button. Keep AuthShell / verify banners / list in the page. No self-link to `/bookings` in the bar.
9. **Owner:** On all four pages, wrap so `TopNav` is full-bleed above the `md:flex` aside+main (early returns too). Add name + Odjava when `me` is present (including email-verify and not-owner). Do not add Moje rezervacije or panel CTA. Do not change `OwnerNav`, switcher, queue, or `WorkerPanel`.
10. **Vitest:** Helper tests for slot/chrome; source-read tests for `TopNav` + each page as named above. Update `designPack.test.ts` so discovery/salon may render `TopNav` but still must not grow homepage hero/footer. Keep `owner.test.ts` / `discovery.test.ts` / `homepage.test.ts` green. No RTL, no Playwright.
11. **Index:** `docs/stories/index.md` and `docs/stories/STORY-43.md` Loop = `STORY-43`.
12. Loop: implement → run every verify command → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
