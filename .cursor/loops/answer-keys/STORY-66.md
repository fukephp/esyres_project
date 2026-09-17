# Answer key: STORY-66

> Epic 1: logged-in TopNav shows `Dobrodošli, {person name}` on every product slot; never email.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-66.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-66 |
| Source | `docs/stories/STORY-66.md` — Dobrodošli + person name in every top-nav |
| Goal (one sentence) | Named logged-in visitors see `Dobrodošli, {Ime i prezime}` as text in every shared top-nav slot; nameless and guests get no identity chip and never an email. |
| Branch name | `story/STORY-66-dobrodosli-person-name` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-17 |

## Pass/fail — product

- [x] Copy (Q1 A): `i18n.ts` `nav.welcome` = `Dobrodošli, {{name}}` (comma, no bang, formal/plural). TopNav greeting is a `<span className={linkClass}>` with `t('nav.welcome', { name: chrome.personName })` — **not** a `Link`, not `chrome.displayName`, not TS concatenation. Same `linkClass` as today (`text-sm text-body`). `nav.bookings` stays `Moje rezervacije`. Chat overlay / `AssistantIntake` still have no `nav.welcome` and no salon-name title (STORY-63 X-only) — verify: Vitest (`homepage.test.ts` `i18n.t('nav.welcome', { name: 'Ana' }) === 'Dobrodošli, Ana'`; `topNav.source.test.ts` reading `TopNav.tsx`: `nav.welcome` + `chrome.personName` inside `<span className={linkClass}>`, no `{chrome.displayName}`; `AssistantIntake.tsx` has no `nav.welcome`; chat `<dialog>` slice in `SalonProfile.tsx` still has `salon.close` and no `nav.welcome`)
- [x] Person name or nothing (Q2 A): replace `homepageDisplayName` with `homepagePersonName(me)` → trimmed `me?.name` if non-empty, else `null`. **Never** read `email`. Delete the email fallback. `topNavChrome` / `homepageChrome` use `personName: string \| null` (null = omit the span). Nameless logged-in still gets the rest of that slot (home: bookings + Odjava + Panel; session: Odjava only; discovery: bookings only; create-salon: empty / no greeting slot) — verify: Vitest `homepage.test.ts` (`homepagePersonName({ name: 'Ana', email: 'x' }) === 'Ana'`; `'  Ana  '` → `'Ana'`; `''` / `'   '` / `null` / `undefined` / `null` me → `null`; function source in `homepage.ts` has no `email`; `topNavChrome('/', nameless)` is `home-session` with `personName: null` and still `bookings` + `logout` + `panel`; `topNavChrome('/bookings', nameless)` is `session` with `personName: null` + `logout`; `topNavChrome('/salons', nameless)` is `discovery` with `personName: null` + `bookings`; `topNavChrome('/create-salon', nameless)` is `empty` with no `personName`; named Ana cases below)
- [x] Slot matrix (Q2 A + story AC): `home-guest` unchanged (Prijava / Registracija / Panel; no `nav.welcome`). Named `/`: `home-session` with `personName: 'Ana'` — TopNav order greeting → `nav.bookings` → Odjava → Panel. Named `/bookings` and `/owner*`: `session` with `personName` — greeting → Odjava (`logoutClass`); **no** `nav.bookings`, **no** Panel. Named `/salons` and `/salon/:id`: `discovery` with `personName` — greeting → `nav.bookings`; **no** Odjava / Panel / Prijava. Named `/create-salon`: new chrome `slot: 'greeting'` with required `personName` — greeting **only** (no bookings, no Odjava, no Panel). Logged-out `/salons` `/salon/:id`: discovery with `personName: null`. Logged-out `/create-salon` `/bookings` `/owner*`: `empty`. `topNavSlot` path map unchanged (`/create-salon` still `'empty'` as the path slot; chrome maps named create-salon to `'greeting'`). Unknown paths stay `empty` even if `me` is passed — verify: Vitest `homepage.test.ts` equality on `topNavChrome` for guest `/`, named `/`, nameless `/`, named `/salons` + `/salon/1`, logged-out `/salons`, named `/create-salon` → `{ slot: 'greeting', personName: 'Ana' }`, nameless `/create-salon` → `empty`, named `/bookings` + `/owner`, logged-out `/bookings` + `/owner/chats`; `topNav.source.test.ts` home-session order `nav.welcome` then `nav.bookings` then `home.logout` then `panelClass`; discovery branch has `nav.welcome` then `nav.bookings` and no `logoutClass` / `panelClass`; session branch has `nav.welcome` then `logoutClass` and no `nav.bookings`; greeting branch is only the welcome span; `slot === 'empty'` still renders no `<nav>`; still exactly two Odjava buttons (`home-session` + `session`)
- [x] Wire `me` (Q3 A): same `ME_QUERY` + `navMe = loading ? null : (data?.me ?? null)` as owner pages. Pass `me={navMe}` on **every** `<TopNav` in `DiscoveryHome.tsx`, `SalonProfile.tsx` (loading / not-found / main — QR is this page), and `CreateSalon.tsx` (loading / auth / verify / form). Homepage, MyBookings, and owner pages already pass `me` — keep that. Do **not** lift Me into a layout. Do **not** change `ME_QUERY` fields. Greeting uses `me.name` only — never `salon.name` — verify: Vitest (`topNav.source.test.ts`: `DiscoveryHome.tsx`, `SalonProfile.tsx`, `CreateSalon.tsx` each match `ME_QUERY` and `me={`; every `<TopNav` in those files includes `me=`; `SalonProfile.tsx` still has no `salon.name` inside `TopNav`; `graphql/auth.ts` `ME_QUERY` selection unchanged this PR)
- [ ] Phone: named session shows `Dobrodošli, {name}` in the existing chip spot on `/`, discovery, salon, create-salon, bookings, and `/owner`; nameless has no chip; bar may wrap, not sticky — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (Dobrodošli in every slot; create-salon greeting-only; never email), `08-Decisions.md` #44 #48, `docs/adr/0029-shared-top-nav.md`, `docs/mvp/04-UI-Design-Goals.md`.

- [x] One React PWA. CSS/Tailwind only (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or PHP. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [x] i18next `bs` only. One new key `nav.welcome`. No Playwright, RTL, Pest, GraphQL codegen — verify: `homepage.test.ts` on `nav.welcome`; `package.json` unchanged deps
- [x] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; no `features/` or `behat.yml` edits this PR

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**This PR (2026-09-17):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host `tsc` not on PATH. Vite container already up. No `esyres_app/marketing`.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

185 Vitest tests passed.

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Profile / name edit, gender field, avatar
- Sticky top-nav
- Chat-overlay title or greeting (STORY-63 stays X-only)
- Odjava or Panel on discovery or create-salon
- `/welcome` route
- Lifting `Me` into a shared layout
- Changing `ME_QUERY` / logout mutation
- Public pricing page
- GSAP / Awwwards / Three.js
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-66.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-66-dobrodosli-person-name` from current `master`.
3. **`i18n.ts`:** add `nav.welcome`: `Dobrodošli, {{name}}`. No other new keys.
4. **`homepage.ts`:** replace `homepageDisplayName` with `homepagePersonName` (Q2 A). Extend `TopNavChrome`: `home-session` / `discovery` / `session` take `personName: string | null`; add `{ slot: 'greeting'; personName: string }` for named create-salon; keep `empty` for nameless/logged-out create-salon and unknown paths. Update `homepageChrome` session to `personName` (null when nameless). `topNavSlot` unchanged.
5. **`TopNav.tsx`:** render `t('nav.welcome', { name: chrome.personName })` in the existing name `<span>` when `personName` is non-null (home-session, discovery, session, greeting). Greeting-only slot is brand + that span. Do not add Odjava/Panel/bookings there. Keep two Odjava buttons only on `home-session` and `session`. Do not make the bar sticky. Delete `chrome.displayName`.
6. **Pages (Q3 A):** pass `me={navMe}` from `ME_QUERY` on DiscoveryHome, every SalonProfile TopNav, every CreateSalon TopNav. Leave owner / bookings / Homepage wiring as-is.
7. **Vitest:** rewrite `homepage.test.ts` (no email fallback; full chrome matrix including `greeting`). Update `topNav.source.test.ts` orders and `me={` on discovery/salon/create-salon. Discovery/salon page files may import `ME_QUERY` but still must not contain `nav.bookings` / `home.logout` / Panel keys (`forbiddenChrome`).
8. **Docs:** set `docs/stories/index.md` and `docs/stories/STORY-66.md` Loop to `STORY-66`. Do not rewrite ADR 0029.
9. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
10. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
