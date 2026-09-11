# Answer key: STORY-42

> Epic 3: one Design 1 pack; owner drops dark nav for Cal light chrome. Keep dense queue + 15-minute grid.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks below from `docs/adr/0026-one-design-1-pack.md` and current PWA chrome.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-42 |
| Source | `docs/stories/STORY-42.md` — One Design 1 pack; owner Cal chrome |
| Goal (one sentence) | Design 1 is the only pack (busy/cell tokens live there; `refs/design-2` is gone), and `/owner` uses Cal light chrome while staying a dense queue + 15-minute grid. |
| Branch name | `cursor/story-42-one-design-1-4e7b` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk Hopic / 2026-09-11 |

## Pass/fail — product

- [x] `refs/design-2` does not exist (no `DESIGN.md`, no `panel-ref.jpg`) — verify: `test ! -d refs/design-2` from git root
- [x] `refs/design-1/DESIGN.md` YAML includes busy tokens `busy-free: "#22C55E"`, `busy-moderate: "#EAB308"`, `busy-busy: "#EF4444"` and cell tokens `cell-free: "#86EFAC"`, `cell-pending: "#FCD34D"`, `cell-proposed: "#93C5FD"`, `cell-booked: "#1A1A1A"`, `cell-off: "#D6D3D1"`; `owner-nav` is canvas/ink (not `surface-dark`); prose records owner density (left nav + queue + 15-minute grid + optional rail; mini-calendar not required; ignore former `panel-ref.jpg` medical/KPI IA) — verify: `grep -F` those YAML lines in `refs/design-1/DESIGN.md` from git root
- [x] Live agent pointers do not send readers to a second pack: `.cursor/CONTEXT.md` folder map, `.cursor/rules/frontend/design-system.mdc`, and root `DESIGN.md` “Which file to read” list only `refs/design-1`. They must not contain `refs/design-2` as a path to open. ADR 0026 / `08-Decisions.md` #42 may still say Design 2 is retired — verify: `grep -n 'refs/design-2' .cursor/CONTEXT.md .cursor/rules/frontend/design-system.mdc DESIGN.md` exits 1
- [x] `esyres_app/frontend/src/index.css` `@theme` keeps the same busy/cell hexes as CSS variables (`--color-busy-free` `#22c55e`, `--color-busy-moderate` `#eab308`, `--color-busy-busy` `#ef4444`, `--color-cell-free` `#86efac`, `--color-cell-pending` `#fcd34d`, `--color-cell-proposed` `#93c5fd`, `--color-cell-booked` `#1a1a1a`, `--color-cell-off` `#d6d3d1`). `--font-display` is `"Cal Sans", Inter, …` (Inter remains `--font-sans`) — verify: Vitest reading `index.css`
- [x] Owner desktop asides on `/owner`, `/owner/chats`, `/owner/stats`, `/owner/requests/:id` are Cal light chrome: `bg-canvas` + `text-ink` + hairline; no `bg-surface-dark`, `text-on-dark`, `md:bg-surface-dark`, or `tone="dark"`. `OwnerNav` has no `tone` prop (always light: idle `text-body`, active `text-ink`, badge `bg-ink text-canvas`). Salon switcher select is hairline/canvas/ink on desktop too — verify: Vitest reading those four pages + `OwnerNav.tsx`
- [x] Dense panel unchanged: `panelCells` still 15-minute steps; `WorkerPanel` still a workers×cells table using `bg-cell-free` / `bg-cell-off` / `bg-cell-booked` / `bg-cell-proposed`; `OwnerHome` still renders the pending queue above `WorkerPanel`. No homepage header/hero/footer on owner routes (no `CompanyPitch`, no `company-pitch` class, no pitch i18n keys) — verify: existing Vitest `isFifteenMinute` / `panelCells`; Vitest reading `WorkerPanel.tsx` + `OwnerHome.tsx`
- [x] Discovery and salon keep sparse customer layout: `DiscoveryHome` stays `main.mx-auto.max-w-md` list (chips + search + names); `SalonProfile` is not a homepage hero/footer. Neither file imports `CompanyPitch` or adds homepage header/footer chrome. They may pick up Cal Sans via `font-display` (shared type token) — verify: Vitest reading `DiscoveryHome.tsx` + `SalonProfile.tsx`; existing `discovery.test.ts` stays green
- [ ] `/owner` light Cal chrome is not a marketing landing (no hero/footer/feature grid on the panel) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md`, `01-Overview-and-Stack.md`, `08-Decisions.md` #41 #42, `docs/adr/0026-one-design-1-pack.md`, `docs/adr/0027-homepage-not-pitch-gate.md`.

- [x] One React PWA in `esyres_app/frontend/`. No sibling marketing site. No new GraphQL, REST, or booking mutations. Panel interactions (accept / drag `proposeTime` / tap fallback / decline) stay as they are — verify: no new schema/feature files this PR; `test ! -d esyres_app/marketing`; existing owner Behat stays green
- [x] Homepage IA stays off discovery, salon, and `/owner`. This PR does not implement STORY-40 (`/salons`, homepage header/footer) or STORY-41 (`/create-salon`) — verify: `App.tsx` routes for `/salons` / `/create-salon` unchanged unless already present; owner/discovery files do not grow homepage header/footer
- [x] i18next `bs` only. No Playwright, RTL, Pest, GraphQL codegen, or `vite-plugin-pwa` work this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

## Verify commands

Run from `esyres_app/` (app root in CONTEXT) unless noted. Stack must be up. Every command must exit 0 before a ready PR.

From **git root**:

```text
test ! -d refs/design-2
grep -F 'busy-free: "#22C55E"' refs/design-1/DESIGN.md
grep -F 'busy-moderate: "#EAB308"' refs/design-1/DESIGN.md
grep -F 'busy-busy: "#EF4444"' refs/design-1/DESIGN.md
grep -F 'cell-free: "#86EFAC"' refs/design-1/DESIGN.md
grep -F 'cell-pending: "#FCD34D"' refs/design-1/DESIGN.md
grep -F 'cell-proposed: "#93C5FD"' refs/design-1/DESIGN.md
grep -F 'cell-booked: "#1A1A1A"' refs/design-1/DESIGN.md
grep -F 'cell-off: "#D6D3D1"' refs/design-1/DESIGN.md
grep -n 'refs/design-2' .cursor/CONTEXT.md .cursor/rules/frontend/design-system.mdc DESIGN.md; test $? -eq 1
```

From **`esyres_app/`** (Compose when Docker is usable; Cloud Agent: if Docker is missing or nested, host PHP + host MySQL like STORY-36 — still `.env.behat` / `esyres_test` only; do not apt-install dockerd; do not `migrate:fresh` or seed `esyres`; frontend `npm` from `esyres_app/frontend/`):

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Homepage IA on `/salons` or `/salon/:id` (STORY-40)
- `/create-salon` / `createSalon` / listed-salon filter (STORY-41)
- Changing panel interactions (accept, drag, tap fallback, decline)
- Public pricing page
- Awwwards / GSAP / Three.js
- New owner IA (KPI cards, mini-calendar, dashboard clone, right rail as required chrome)
- Rewriting historical `E*` / `STORY-*` / `MKT-*` maps and keys that still say Design 2
- Re-introducing `panel-ref.jpg`
- Playwright, RTL, Pest, GraphQL codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-42.md`, `docs/adr/0026-one-design-1-pack.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`, `refs/design-2/DESIGN.md` (before delete), `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: keep `cursor/story-42-one-design-1-4e7b`.
3. **Pack:** Copy busy/cell YAML + status tables + owner composition rules (dense left nav, queue + 15-minute grid, optional rail; phone stacks queue above grid; mini-cal not required) from `refs/design-2/DESIGN.md` into `refs/design-1/DESIGN.md`. Change owner nav from dark (`surface-dark`) to Cal light (`canvas` / `ink` / hairline). Add `owner-nav` component token on canvas. Keep status colors separate from brand chrome. Then delete `refs/design-2/` entirely (`panel-ref.jpg` is already absent — do not add one). Past-tense root `DESIGN.md` so it no longer says STORY-42 will move tokens. CONTEXT folder map and `design-system.mdc` already point at Design 1 only — do not re-add a second pack. Do not rewrite historical loop maps.
4. **CSS:** Keep busy/cell CSS variables as they are (hexes above). Set `--font-display` to `"Cal Sans", Inter, ui-sans-serif, system-ui, sans-serif`. Leave `--font-sans` as Inter. `--color-surface-dark` may stay in `@theme` (Design 1 still has the unused dark surface token) but owner UI must not use it.
5. **Owner chrome:** Drop `tone` from `OwnerNav` (always the current light classes). Desktop asides on `OwnerHome`, `OwnerChats`, `OwnerStats`, `OwnerRequestDetail`: `bg-canvas text-ink` + `border-r border-hairline` (keep `hidden md:flex md:w-56`). Switcher `<select>`: drop `md:border-white/20 md:bg-surface-dark md:text-on-dark` so desktop matches the existing phone hairline/canvas/ink select. Do not add homepage header, hero, footer, or feature grid to `/owner*`. Do not change queue actions, `@dnd-kit`, tap fallback, or grid math.
6. **Customer:** Do not restyle `DiscoveryHome` / `SalonProfile` as homepage IA. No new header/footer/hero there. Shared tokens (including Cal Sans on existing `font-display` headings) are allowed.
7. **Vitest:** New tests that read `index.css` and the owner/discovery/salon source files for the checks above. Keep `owner.test.ts` (15-minute cells) and `discovery.test.ts` green. No RTL, no Playwright.
8. Loop: implement → run every verify command → fix. Cap 8. Same failure twice → escalate.
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots.
10. On escalate: draft/blocked PR with failing checks and the human decision needed.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
