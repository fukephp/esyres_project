# Answer key: STORY-40

> Epic 1: permanent Bosnian homepage on `/`; discovery moves to `/salons`. Kill persist-seen / `HomeGate`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Fog: sharp (no map). ADR 0027 + `docs/stories/STORY-40.md` already lock routing.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-40 |
| Source | `docs/stories/STORY-40.md` — Homepage on `/`; discovery at `/salons` |
| Goal (one sentence) | Typed `/` is always the Bosnian homepage (header + existing hero + footer); Pronađi salon goes to `/salons` where discovery and geolocation mount; no persist-seen. |
| Branch name | `cursor/story-40-homepage-salons-1359` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-11 |

## Pass/fail — product

- [ ] `isHomepagePath(path)` is true only for `/` and `''`. `isDiscoveryHomePath(path)` is true only for `/salons`. `/salon/:id`, `/bookings`, `/owner`, `/owner/stats`, `/welcome`, `/create-salon` are neither — verify: Vitest (`esyres_app/frontend/src/lib/homepage.ts`)
- [ ] `homepageDisplayName({ name, email })` returns trimmed `name` when non-empty, else `email`. Empty / whitespace name falls back to email — verify: Vitest
- [ ] `DISCOVERY_HREF` is `/salons`. `CREATE_SALON_HREF` is `/create-salon`. Pronađi salon is a `Link`/`navigate` to `DISCOVERY_HREF`, not a localStorage write — verify: Vitest + `Homepage` CTA `to`/`href`
- [ ] i18n `bs`: existing `pitch.h1` / `pitch.support` / `pitch.step1`–`step3` / `pitch.cta` / `pitch.brand` unchanged. New: `home.getPanel` `Imaš salon? Otvori panel`; `home.logout` `Odjava`; `home.footerCity` `Sarajevo`; `home.footerLine` `Termini bez jurnjave.` Header Prijava/Registracija reuse `auth.login` / `auth.register` — verify: Vitest
- [ ] `HomeGate.tsx`, `companyPitch.ts`, `companyPitch.test.ts`, and `esyres.companyPitchSeen` are gone. Leftover localStorage does not change `/` — verify: `test ! -f frontend/src/pages/HomeGate.tsx`; `test ! -f frontend/src/lib/companyPitch.ts`; grep `companyPitchSeen` empty under `esyres_app/frontend/`
- [ ] `App.tsx`: `/` → `Homepage` (header + hero + footer only). `/salons` → `DiscoveryHome` (and `useGeo`). Catch-all `*` still `Navigate` to `/`. No `/welcome`. `/create-salon` is **not** registered this PR — verify: `App.tsx`; `test ! -d marketing`
- [ ] GraphQL `User.name: String!`; `me { name }` after register `"ana@example.com"` is `"ana"` — verify: Behat (`features/guest/register.feature` + `meQuery` selects `name`)
- [ ] Logged-in header shows `homepageDisplayName` + Odjava; guest header shows Prijava, Registracija, Get your panel (`CREATE_SALON_HREF`). Opening AuthShell does not unmount hero or Pronađi salon. After login/logout stay on `/`. `me.salons.length > 0` does not navigate to `/owner` — verify: Vitest (`homepageChrome` guest vs session helpers) + `Homepage.tsx` has no `navigate('/owner')`
- [ ] `/salons` has mark+wordmark `Link` to `/`. That row is not the homepage header (no Prijava, no Get your panel, no homepage footer). `/salon/:id` does not add that home link — verify: Vitest i18n/brand on discovery helper + `DiscoveryHome.tsx` has `Link to="/"`; `SalonProfile.tsx` has none
- [ ] One-screen Design 1 on `/` (white canvas, black CTA, Cal Sans display or Inter 600 fallback, light footer). After Pronađi salon, `/salons` is today’s discovery list. `/salon/:id` and `/owner` unchanged this PR — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/` homepage, `/salons` discovery), `08-Decisions.md` #41 #15, `docs/adr/0027-homepage-not-pitch-gate.md`, `docs/adr/0024-company-pitch-in-pwa.md` (no sibling marketing site still holds).

- [ ] Homepage IA (header + hero + footer) is scoped to `/` only. Discovery, salon, `/owner` do not get that chrome. One React PWA; no `/welcome`; `esyres_app/marketing/` stays gone — verify: routes; `test ! -d marketing`; no homepage footer import on salon/owner
- [ ] `GET /qr/{id}` stays Laravel 302. Valid salon → `/salon/:id`. Missing salon → `SpaUrl::home()` (`/`) which is now the homepage. Do not change `QrController` — verify: `QrController.php` / `SpaUrl.php` unchanged this PR
- [ ] `User.name` is the existing Eloquent column (non-null string). No migration. No `createSalon` mutation, listed-salon filter, Design-2 delete, or owner restyle — verify: no new migration; schema `name` on `User`; no `createSalon` in this PR
- [ ] No Playwright, RTL, Pest, GraphQL codegen, `vite-plugin-pwa` this PR. Behat flags CLI-only; do not change `behat.yml` — verify: `esyres_app/frontend/package.json`; no `pestphp`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0 before the loop may open a ready PR.

Cloud Agent: if Docker is missing or dockerd is nested, use **host PHP + host MySQL** (STORY-36), still `.env.behat` / `esyres_test` only. Do **not** apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Same Behat flags.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
test ! -d marketing
test ! -f frontend/src/pages/HomeGate.tsx
test ! -f frontend/src/lib/companyPitch.ts
```

## Out of scope

- Implementing `/create-salon` or `createSalon` (STORY-41)
- Changing Get your panel to Panel for existing owners (STORY-41)
- Listed-salon filter (STORY-41)
- Deleting Design-2 / restyling `/owner` (STORY-42)
- Public waitlist, Formspree, `/invite`, `/signup`
- Public pricing page
- Awwwards / GSAP / Three.js
- Geocoding
- Rewriting historical `MKT-*` or STORY-39 acceptance criteria
- Language switcher; English homepage
- Playwright, RTL, Pest, GraphQL codegen, `vite-plugin-pwa` this PR
- Changing valid-QR 302 to `/salon/:id`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-40.md`, `docs/glossary.md` (**Homepage**, **Discovery home**), `docs/adr/0027-homepage-not-pitch-gate.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run `landing-page` unless the user explicitly asks for extra homepage polish.
2. Branch: `cursor/story-40-homepage-salons-1359`.
3. **Helpers** (`esyres_app/frontend/src/lib/homepage.ts` + `homepage.test.ts`): `isHomepagePath`, `isDiscoveryHomePath`, `homepageDisplayName`, `DISCOVERY_HREF = '/salons'`, `CREATE_SALON_HREF = '/create-salon'`. Guest vs session chrome: guest keys are Prijava + Registracija + getPanel; session keys are display name + Odjava + getPanel (still `/create-salon` this PR). Delete `companyPitch.ts` / `HomeGate.tsx` / persist-seen tests.
4. **Routes:** `App.tsx` `/` → `Homepage`. `/salons` → `DiscoveryHome`. Catch-all `*` → `/`. Do **not** add a `/create-salon` route (clicking Get your panel hits catch-all until STORY-41; the AC is the link). `/salon/:id`, `/bookings`, `/owner*` unchanged. No `/welcome`.
5. **Homepage:** Header only here: mark + wordmark (`pitch.brand`), guest `auth.login` / `auth.register` buttons, `home.getPanel` `Link` to `CREATE_SALON_HREF`. Logged-in: `ME_QUERY` `name` + `email` → `homepageDisplayName`, `home.logout` + `LOGOUT_MUTATION` (refetch `Me`), stay on `/`. Never `navigate('/owner')`. Hero reuses `CompanyPitch` copy/layout (H1, support, three steps, Pronađi salon) but CTA is `Link` to `/salons` (`type` not needed). Wordmark lives in the header (do not duplicate a second brand row in the hero). Footer: `home.footerCity` + `home.footerLine`. Light footer, not `{colors.surface-dark}`. No Terms, Privacy, cookies, Instagram, language toggle, feature grid, product mock.
6. **AuthShell:** Reuse on `/` with `allowRegister`. Add optional `initialMode?: 'login' | 'register'` (default `login`). Prijava opens login; Registracija opens register. Render AuthShell **under the header without unmounting hero + CTA** (not a login wall). `onAuthenticated` closes the form and stays on `/`. One account — do not send owners to a different door.
7. **Discovery:** Mount only on `/salons`. `useGeo` stays inside `DiscoveryHome` (so it does not run on `/`). Add mark+wordmark `Link to="/"`. Keep `BookingsLink`. Do not add homepage header/footer. Do not add that home logo on `/salon/:id`.
8. **GraphQL:** `type User { name: String! }` in `esyres_app/graphql/schema.graphql` (Eloquent column; no migration). `ME_QUERY` (and login/register selections if they return `User`) select `name`. Behat `meQuery` selects `name`; after register `ana@example.com`, `me name is "ana"` (new Then or extend the existing register scenario that already checks DB name). Do not change `QrController`.
9. **Design 1:** Keep pitch-scoped Cal Sans (rename `.company-pitch` root if the page is `Homepage`; discovery/salon/`/owner` stay Inter). White canvas, `#111` CTA, 8px radius, 40px height. Do not restyle AuthShell globally (bookings/owner keep today’s form).
10. **Copy:** informal *ti*. Do not change `pitch.*` hero strings. Do not add English chrome.
11. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-40.md` Loop to `STORY-40`.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots. Do not type credentials into the IDE browser.
14. After PR: trivial Bugbot nits on the same PR (do not burn the cap). If Bugbot contradicts this key, stop and ask.
