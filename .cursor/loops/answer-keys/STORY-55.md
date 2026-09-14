# Answer key: STORY-55

> Epic 7: create/update workers by name on `/owner/salons/:id`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-55.md` and the story-loop grill (Q1 / Q2 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-55 |
| Source | `docs/stories/STORY-55.md` — Workers on salon edit |
| Goal (one sentence) | Owners list, create, and update this shop’s workers by name on salon edit via existing `createSalonWorker` / `updateSalonWorker`, so guests can request them without a separate workers home. |
| Branch name | `story/STORY-55-workers-on-salon-edit` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-14 |

## Pass/fail — product

- [x] `CREATE_SALON_WORKER_MUTATION` is `createSalonWorker(salonId: ID!, input: CreateSalonWorkerInput!)` returning `id name`. `UPDATE_SALON_WORKER_MUTATION` is `updateSalonWorker(id: ID!, input: UpdateSalonWorkerInput!)` with the same return. No new GraphQL field or PHP mutation — verify: Vitest reading `graphql/auth.ts` (next to `UPDATE_SALON_SERVICE_MUTATION`); `git diff` of this PR has no files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] `ME_QUERY` `salons` adds `workers { id name }` (keep existing `services` block). `MeData.salons` includes `workers: { id: string; name: string }[]` — verify: Vitest reading `graphql/auth.ts` + `MeData`
- [x] i18n `bs` only these new keys: `owner.workers` `Radnici`; `owner.workerName` `Ime radnika`; `owner.addWorker` `Dodaj`; `owner.INVALID_WORKER_NAME` `Unesi ime radnika.`; `owner.DUPLICATE_WORKER_NAME` `Radnik s tim imenom već postoji.` Reuse `owner.noWorkers` `Nema radnika.`; `owner.save` / `owner.FORBIDDEN`. Do not reuse `owner.INVALID_NAME` for a worker. Do not use `salon.worker` as the section heading — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] `/owner/salons/:id` (`OwnerSalonEdit.tsx`): hours form and services block unchanged (name/address/hours/cancel + one Spremi; that submit does **not** call worker mutations; services Spremi/Dodaj stay as STORY-54). Below services, heading `owner.workers`. Empty `salon.workers` → `owner.noWorkers`. Each existing worker: name text + Spremi → `updateSalonWorker`. Then one add form: name + `owner.addWorker` → `createSalonWorker`. No `<select>`. No delete. No per-worker hours, photos, bios, or assignment matrix — verify: Vitest reading `OwnerSalonEdit.tsx` (flip STORY-54 “no `createSalonWorker`” on this page only; hours submit still has no worker mutations; services mutations still present)
- [x] Create and update send `{ name: trimmed }`. After either success, refetch `Me`. Stay on the page. Create success clears the add-form name — verify: Vitest reading `OwnerSalonEdit.tsx` (`refetch` after both worker mutations; add path clears name)
- [x] Worker mutation errors: `INVALID_NAME` → `owner.INVALID_WORKER_NAME`; `DUPLICATE_WORKER_NAME` → `owner.DUPLICATE_WORKER_NAME`; `FORBIDDEN` → `owner.FORBIDDEN`; other → `salon.gate.fallback`. Hours Spremi still maps `INVALID_NAME` to `owner.INVALID_NAME`. Service mutations still map `INVALID_NAME` to `owner.INVALID_SERVICE_NAME` — verify: Vitest reading `OwnerSalonEdit.tsx` (all three maps present)
- [x] `CreateSalon.tsx` and `OwnerSalonCreate.tsx` unchanged (no workers UI). No DND, photos, coords, reschedule cap, assignment matrix, delete/deactivate, or worker login — verify: Vitest reading those two pages still have no `createSalonWorker`; edit page has no `updateSalonDnd` / `deleteSalonWorker` / `deleteSalonService`
- [ ] Workers block is dense owner chrome (Cal light, hairline fields, black `rounded-md` Spremi/Dodaj, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` salon edit includes workers by name), `05-Data-Model.md` (Worker name; not a user; inherits salon hours; no delete in this slice), `08-Decisions.md` #3 #34 #46, `docs/adr/0032-owner-salon-catalog.md`.

- [x] One React PWA. Existing Lighthouse `createSalonWorker` / `updateSalonWorker` only; no REST; no new mutation/resolver. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or a web.php route; no new files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. Five new `owner.*` keys listed above. Workers are not users. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + loop docs. Expected: **skip Behat**. Do not change `behat.yml`. Do not edit `CreateSalonWorker.php` / `UpdateSalonWorker.php` — verify: CONTEXT classifier at verify time; no PHP/schema/feature files in the PR diff

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

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

**This PR (2026-09-14):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host `tsc` not on PATH. Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

173 Vitest tests passed.

## Out of scope

- Delete / hide / deactivate worker
- Worker↔service assignment matrix
- Worker login (Phase 2)
- Per-worker shifts, vacation, photos, bios
- Sentinel “no preference” worker row on salon edit
- Changing `createSalonWorker` / `updateSalonWorker` rejection rules
- DND (stays on chats); photos; coordinates; geocode
- Hours editor behavior (STORY-53)
- Services editor behavior (STORY-54)
- Add-salon / `/create-salon` workers
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-55.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-55-workers-on-salon-edit` from current `master`.
3. **PWA GraphQL only:** add `CREATE_SALON_WORKER_MUTATION` and `UPDATE_SALON_WORKER_MUTATION` next to the service mutations. Add `workers { id name }` to `ME_QUERY` `salons`. Do not touch schema, PHP, or Behat features.
4. **Edit page:** keep STORY-53 hours form and STORY-54 services block. Workers block **below** services, not inside hours submit. Per-row update + one add form as product checks. No `<select>`. Flip `ownerSalons.source.test.ts` “no `createSalonWorker`” on edit only.
5. **Copy:** five new keys only. Reuse `owner.noWorkers`. Assert in `owner.test.ts`.
6. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-55.md` Loop to `STORY-55`.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
