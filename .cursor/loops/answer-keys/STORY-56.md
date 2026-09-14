# Answer key: STORY-56

> Epic 7: exclusive Informacije / Radno vrijeme / Usluge / Radnici chips on `/owner/salons/:id`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-56.md` and the product grill (exclusive chips, split saves, in-memory hide, OwnerNav chip look, full-width hairline box).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-56 |
| Source | `docs/stories/STORY-56.md` — Exclusive chips on salon edit |
| Goal (one sentence) | Owners edit one salon-edit chunk at a time via exclusive Bosnian chips and a full-width boxed panel, without new routes or mutations. |
| Branch name | `story/STORY-56-salon-edit-chips` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-14 |

## Pass/fail — product

- [x] `/owner/salons/:id` route unchanged (still `path="/owner/salons/:id"`; no `/edit`, no nested hours route). Edit page does not read `useSearchParams`, `?tab=`, or `location.hash` for the chip. Catalog / add-salon still navigate to `ownerSalonEditPath(id)` — verify: Vitest (`ownerSalons.source.test.ts` App paths + edit page has no `useSearchParams` / `?tab=` / `hash`; create still `ownerSalonEditPath`)
- [x] Four in-page chips under the salon `<h1>`, Bosnian: `owner.info` `Informacije`; `salon.hours` `Radno vrijeme`; `salon.services` `Usluge`; `owner.workers` `Radnici`. Default chip state is Informacije. Buttons `type="button"`. Active `font-semibold text-ink`, idle `text-body` (same tokens as OwnerNav). Row `flex flex-wrap`. No `rounded-full` / `rounded-md` on the chips, no `border-b` underline bar, no badge spans on these chips. Aside still only the existing OwnerNav — verify: Vitest (`owner.test.ts` `i18n.t('owner.info')`; `ownerSalons.source.test.ts` reading `OwnerSalonEdit.tsx` + `OwnerNav.tsx` unchanged aside)
- [x] One panel visible at a time via `hidden` on the inactive three (do **not** unmount — keep typed values). Informacije: name + address + Spremi → `updateSalon` only. Radno vrijeme: existing weekday editor + cancel window + Spremi → `updateSalonHours` only. Usluge / Radnici stay STORY-54/55 create/update (no delete). Chip click does not call those mutations and has no `window.confirm` / dirty modal — verify: Vitest reading `OwnerSalonEdit.tsx` (two submit fns; info submit has `updateSalon` not `updateSalonHours`; hours submit has `updateSalonHours` not `updateSalon`; both omit service/worker mutations; `hidden` present; no `window.confirm`; flip the old combined `onSubmit` slice)
- [x] Owned-salon content drops `max-w-md` on the info/hours forms and services/workers sections. Visible panel is one `border border-hairline` box spanning owner `main`. Logged-out / email-verify / not-owner gates may keep `max-w-md`. Hours rows stay the existing list (`type="time"` `step={900}`), not a 7-column week grid — verify: Vitest (`OwnerSalonEdit.tsx` owned block has `border-hairline` and no `max-w-md` on those forms/sections; still `type="time"` / `step={900}`; no `grid-cols-7` on hours)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` exclusive chips), `08-Decisions.md` #46, `docs/adr/0032-owner-salon-catalog.md`.

- [x] One React PWA. No new GraphQL / PHP / Behat. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. One new key `owner.info`. Reuse `salon.hours` / `salon.services` / `owner.workers`. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `owner.test.ts`; `esyres_app/frontend/package.json` unchanged deps
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

**This PR (2026-09-14):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host `tsc` not on PATH. Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

173 Vitest tests passed.

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

- `?tab=` / hash / nested salon-edit routes
- Dirty-leave modal; auto-save on chip change
- Fifth chip, wizard, photos, map, guest-preview
- Delete / deactivate; assignment matrix; DND; coords; reschedule cap
- New GraphQL mutations
- Restyle hours into a week-shaped grid
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-56.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-56-salon-edit-chips` from current `master`. Include already-persisted STORY-56 docs (`docs/stories/STORY-56.md`, mvp/CONTEXT/architecture/glossary/ADR patches) on this branch if they are still uncommitted on `master`.
3. **Edit page only:** chips + split saves + `hidden` panels + drop `max-w-md` on owned content + one hairline box. Keep STORY-54/55 service/worker forms. Flip `ownerSalons.source.test.ts` combined-`onSubmit` assertions.
4. **Copy:** `owner.info` = `Informacije`. Reuse hours/services/workers keys. Assert in `owner.test.ts`.
5. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-56.md` Loop to `STORY-56`.
6. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
7. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
8. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
