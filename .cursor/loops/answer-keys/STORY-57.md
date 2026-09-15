# Answer key: STORY-57

> Epic 1: Cal `button-destructive` Odjava on both logged-in TopNav slots.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-57.md` and the story-loop grill (one `logoutClass`, two `@theme` vars only, Vitest source reads, skip Behat expected).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-57 |
| Source | `docs/stories/STORY-57.md` — Odjava as Cal destructive button |
| Goal (one sentence) | Logged-in Odjava in the shared top-nav reads as a destructive action (red Cal pill, same size as Panel) on `/` and on `/bookings` + `/owner*`. |
| Branch name | `story/STORY-57-odjava-destructive` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-15 |

## Pass/fail — product

- [x] Both Odjava buttons (`home-session` and `session`) use one `logoutClass` next to `panelClass`. Copy stays `t('home.logout')`. Same `LOGOUT_MUTATION`; `onClick={() => void logout()}`. No `window.confirm` / `confirm(` — verify: Vitest (`topNav.source.test.ts` reading `TopNav.tsx`)
- [x] `logoutClass` matches Panel geometry: `inline-flex h-10 items-center rounded-md px-5 text-sm font-semibold`. White label `text-canvas` (existing token; do **not** add `--color-on-primary`). Fill `bg-error-strong`. Press `active:bg-error-strong-active`. No `hover:` on that class. Not `rounded-full`. Prijava / Registracija / name / Moje rezervacije stay `linkClass` (`text-sm text-body`) — verify: Vitest (`topNav.source.test.ts`)
- [x] `@theme` in `index.css` adds only `--color-error-strong: #dc2626` and `--color-error-strong-active: #b91c1c`. Does not add `--color-error`. Odjava fill is not `busy-busy` / `#ef4444` / `bg-ink` — verify: Vitest (`topNav.source.test.ts` reading `index.css` + `TopNav.tsx`)
- [x] Homepage logged-in slot order in `TopNav.tsx` stays **name → Odjava → Panel** (`displayName` span, then logout button, then `panelClass` Link). Create-salon / empty slot unchanged (no Odjava). `home.logout` stays `Odjava` — verify: Vitest (`topNav.source.test.ts` home-session order; existing `homepage.test.ts` `i18n.t('home.logout')`)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (logged-in Odjava is Cal `button-destructive`, same size as Panel), `08-Decisions.md` #42 #44, `docs/adr/0026-one-design-1-pack.md`, `docs/adr/0029-shared-top-nav.md`, `refs/design-1/DESIGN.md` (`button-destructive` / `error-strong`).

- [x] One React PWA. No new GraphQL / PHP / Behat / logout mutation. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. Reuse `home.logout`. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `homepage.test.ts`; `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + docs/loop files. Expected: **skip Behat**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

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

**This PR (2026-09-15):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host `tsc` not on PATH. Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

174 Vitest tests passed.

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

- Confirm dialog; Odjava hover
- Wiring `--color-error` or restyling form errors off `text-busy-busy`
- Owner Decline / customer cancel as `button-destructive`
- New logout surfaces (`/salons`, `/create-salon`)
- Copy change to Odjavi se
- `--color-on-primary`; restyling Panel
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-57.md`, `docs/architecture/04-Frontend.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-57-odjava-destructive` from current `master`.
3. **Tokens:** add `--color-error-strong` and `--color-error-strong-active` to `@theme` in `esyres_app/frontend/src/index.css` only. Do not add `--color-error` or `--color-on-primary`.
4. **TopNav:** add `logoutClass` mirroring `panelClass` geometry; both Odjava buttons use it. Keep `LOGOUT_MUTATION`. Keep home-session order name → Odjava → Panel. Do not touch discovery / empty slots.
5. **Tests:** extend `topNav.source.test.ts` (logoutClass + both buttons + CSS vars + no `--color-error` + home-session order). Keep `homepage.test.ts` Odjava copy.
6. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-57.md` Loop to `STORY-57`.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
