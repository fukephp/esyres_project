# Answer key: STORY-68

> Epic 7: boxed salon catalog, Uredi, plus under the title.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-68.md` and the story-loop grill (Q1 square 40×40 plus, Q2 `space-y-3` boxes, Q3 hairline secondary Uredi Link).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-68 |
| Source | `docs/stories/STORY-68.md` — Salon catalog boxed shops, Uredi, header plus |
| Goal (one sentence) | Owner catalog is stacked hairline boxes (name + open now, Uredi) with a plus under Saloni as the only add, not a name-as-link table with footer Dodaj salon. |
| Branch name | `story/STORY-68-salon-catalog-boxes` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-20 |

## Pass/fail — product

- [x] `/owner/salons` keeps the existing overlay (`TopNav` + `min-h-svh md:flex` aside + `OwnerNav` `active="salons"`), `salonIsOpenNow` Otvoreno/Zatvoreno, logged-out AuthShell, unverified `EmailVerifyPanel`, and zero-salons not-owner shell (`owner.title`, `CREATE_SALON_PATH` / `owner.createSalon` only — no plus, no Uredi). Routes stay `/owner/salons`, `/owner/salons/create`, `/owner/salons/:id`. No new GraphQL — verify: Vitest reading `OwnerSalons.tsx` + existing `ownerSalons.source.test.ts` overlay/not-owner asserts; `git diff` of this PR has no `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/` files
- [x] Owner heading block order: h1 `t('owner.salons')`, then **one** Cal primary plus `Link` to `ownerSalonCreatePath()`, then phone `OwnerNav` (`md:hidden`), then the shop list. No add control after the list. Plus classes: `inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-semibold text-canvas active:bg-[#242424]`. Visible child is `+`. Accessible name `aria-label={t('owner.addSalon')}` (`Dodaj salon`). Not `px-5`, not `rounded-full`, not a footer text link — verify: Vitest (`ownerSalons.source.test.ts` reading `OwnerSalons.tsx`: indexOf `owner.salons` < plus `aria-label` < `md:hidden` OwnerNav < shop `<ul`; plus class has `h-10 w-10` and `bg-ink`; page has `aria-label={t('owner.addSalon')}`; no `divide-y` catalog list; create path does not appear after the `</ul>`)
- [x] Shop list: `ul` `mt-8 max-w-xl space-y-3` (not `divide-y` / `border-y`). Each shop is `li` `flex items-center justify-between gap-3 border border-hairline p-5` (same grammar as salon-edit `PANEL`; not `rounded-lg`; not `md:grid-cols-2` / 2-up). Left: name as plain text (`{row.name}`, not a `Link`) over muted `owner.openNow` / `owner.closedNow` from `salonIsOpenNow(row.hours)`. Right: **Uredi** `Link` `to={ownerSalonEditPath(row.id)}` with `inline-flex h-10 shrink-0 items-center rounded-md border border-hairline bg-canvas px-5 text-sm font-semibold text-ink` and `t('owner.edit')`. Box face is not a tap target (no wrapping `Link`/`onClick` on `li`). No kebab, address, stats, listed chip, photos, or `?salon=` on the card. No `navigate(` — verify: Vitest (`ownerSalons.source.test.ts` + `owner.test.ts` `i18n.t('owner.edit') === 'Uredi'`)
- [x] i18n `bs` only this new key: `owner.edit` `Uredi`. Reuse `owner.addSalon` / `owner.salons` / `owner.openNow` / `owner.closedNow`. Create-page h1 still `owner.addSalon`. Edit/home still have no add-salon control — verify: Vitest (`owner.test.ts` + existing `edit and home have no add-salon control`)
- [ ] Catalog chrome is boxed shops + header plus (not a divided table, not discovery cards, not guest column) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons` stacked hairline boxes, Uredi, plus under the title), `08-Decisions.md` #42 #46, `docs/adr/0032-owner-salon-catalog.md`, `docs/adr/0026-one-design-1-pack.md`, `refs/design-1/DESIGN.md` (`button-primary` 40px / `button-secondary`).

- [x] One React PWA. Catalog-only chrome change. No sibling `marketing/`. No new GraphQL field, REST resource, or mutation — verify: `esyres_app/frontend/package.json` unchanged deps; no new files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. One new `owner.edit` key. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `package.json` unchanged deps; product copy check
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + docs/loop files. Expected: **skip Behat**. Do not change `behat.yml`. Do not add routes or change `/create-salon` — verify: CONTEXT classifier at verify time; `App.tsx` routes unchanged; `CreateSalon.tsx` untouched

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + docs/loop files. Expected skip: no PHP / `features/` / `graphql/` schema edits.

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

**This PR (2026-09-20):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host `npm run typecheck` passed; host Vitest/Vite failed (rolldown native binding). Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

190 tests passed.

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

- First-shop `/create-salon`; plus does not onboard shop #1
- Add-salon form fields; salon-edit chips / hours / services / workers
- Per-box kebab into Informacije / Radno vrijeme / Usluge / Radnici
- Queue counts, occupying-job crumbs, or mini-stats on boxes
- Using the box as a salon switcher
- Delete / deactivate; photos; coordinates
- `md+` card grid
- New GraphQL; Playwright; RTL; new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-68.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-68-salon-catalog-boxes` from current `master`. Include already-persisted STORY-68 product docs if still uncommitted (`docs/stories/STORY-68.md`, `docs/stories/index.md`, CONTEXT / ADR 0032 / architecture / mvp catalog chrome). Do not rewrite them beyond the Loop slug below.
3. **Plus:** under the Saloni h1, one `Link` to `ownerSalonCreatePath()` with the Q1 classes (`h-10 w-10`, white `+`, `aria-label={t('owner.addSalon')}`). Remove the footer `Dodaj salon` text link under the list. Phone OwnerNav stays after h1+plus.
4. **Boxes:** replace `divide-y` rows with `space-y-3` hairline `p-5` boxes. Name plain text; open-now muted under it; Uredi `Link` only to `ownerSalonEditPath(row.id)` with Q3 secondary classes. No `navigate(`.
5. **Copy:** add `owner.edit` `Uredi` in `i18n.ts`. Assert in `owner.test.ts`. Flip `ownerSalons.source.test.ts` catalog test off name-as-link / `divide-y` / footer add; on plus aria-label, box classes, Uredi Link.
6. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-68.md` Loop to `STORY-68`.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
