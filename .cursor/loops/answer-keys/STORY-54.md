# Answer key: STORY-54

> Epic 7: create/update services on `/owner/salons/:id`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-54.md` (compiled). Locks from `docs/stories/STORY-54.md` and the story-loop grill (Q1–Q5 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-54 |
| Source | `docs/stories/STORY-54.md` — Services on salon edit |
| Goal (one sentence) | Owners list, create, and update this shop’s services on salon edit via existing `createSalonService` / `updateSalonService`, so the catalog shop’s menu is editable without a second settings app. |
| Branch name | `story/STORY-54-services-on-salon-edit` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-14 |

## Pass/fail — product

- [x] `CREATE_SALON_SERVICE_MUTATION` is `createSalonService(salonId: ID!, input: CreateSalonServiceInput!)` returning `id name category durationMinutes priceFeninga`. `UPDATE_SALON_SERVICE_MUTATION` is `updateSalonService(id: ID!, input: UpdateSalonServiceInput!)` with the same return. No new GraphQL field or PHP mutation — verify: Vitest reading `graphql/auth.ts` (next to `UPDATE_SALON_MUTATION`); `git diff` of this PR has no files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] `ME_QUERY` `salons` adds `services { id name category durationMinutes priceFeninga }`. `MeData.salons` includes `services: { id: string; name: string; category: string; durationMinutes: number; priceFeninga: number }[]` — verify: Vitest reading `graphql/auth.ts` + `MeData`
- [x] Helper `kmToFeninga(raw)` in `owner.ts`: trim; treat `,` as decimal; `Number` then `Math.round(n * 100)`. Empty / NaN / negative → `null`. `0` → `0`. `25` → `2500`; `25.50` / `25,50` → `2550`. Inverse seed `feningaToKm(feninga)` is `(feninga / 100).toString()` — verify: Vitest (`owner.test.ts`)
- [x] i18n `bs` only these new keys: `owner.serviceName` `Ime usluge`; `owner.duration` `Trajanje (min)`; `owner.price` `Cijena (KM)`; `owner.addService` `Dodaj`; `owner.INVALID_SERVICE_NAME` `Unesi ime usluge.`; `owner.INVALID_DURATION` `Trajanje mora biti 15 min ili više (korak 15).`; `owner.INVALID_PRICE` `Cijena nije ispravna.`; `owner.DUPLICATE_SERVICE_NAME` `Usluga s tim imenom već postoji.` Reuse `salon.services` `Usluge`; `salon.emptyServices` `Nema usluga.`; `category.HAIR` / `MAKE_UP` / `MASSAGE`; `owner.save` / `owner.FORBIDDEN`. Do not reuse `owner.INVALID_NAME` for a service — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] `/owner/salons/:id` (`OwnerSalonEdit.tsx`): hours form unchanged (name/address/hours/cancel + one Spremi; that submit does **not** call service mutations). Below it, heading `salon.services`. Empty `salon.services` → `salon.emptyServices`. Each existing service: name text, three category radios (`t('category.${cat}')` for `HAIR` `MAKE_UP` `MASSAGE`), duration `type="number"` `step={15}` `min={15}` labeled `owner.duration`, price KM `type="number"` labeled `owner.price`, Spremi → `updateSalonService`. Then one add form: same fields (category default `HAIR`, duration empty, price empty) + `owner.addService` → `createSalonService`. No `<select>`. No delete. No `createSalonWorker` — verify: Vitest reading `OwnerSalonEdit.tsx` (flip STORY-53 “no `createSalonService`” on this page only; hours call order unchanged)
- [x] Create: trim name; `kmToFeninga` null → `owner.INVALID_PRICE` and do not call; empty duration omits `durationMinutes` from input (server 30); otherwise send int minutes. Update: always send `durationMinutes` as int (seed from row) + `kmToFeninga` of the KM field. After either success, refetch `Me`. Stay on the page — verify: Vitest reading `OwnerSalonEdit.tsx` (omit `durationMinutes` on create when empty; update always includes it; `refetch` after both)
- [x] Service mutation errors: `INVALID_NAME` → `owner.INVALID_SERVICE_NAME`; `INVALID_DURATION` → `owner.INVALID_DURATION`; `INVALID_PRICE` → `owner.INVALID_PRICE`; `DUPLICATE_SERVICE_NAME` → `owner.DUPLICATE_SERVICE_NAME`; `FORBIDDEN` → `owner.FORBIDDEN`; other → `salon.gate.fallback`. Hours Spremi still maps `INVALID_NAME` to `owner.INVALID_NAME` — verify: Vitest reading `OwnerSalonEdit.tsx` (both maps present)
- [x] `CreateSalon.tsx` and `OwnerSalonCreate.tsx` unchanged (no services UI). No workers, DND, photos, coords, reschedule cap, assignment matrix, or delete control — verify: Vitest reading those two pages still have no `createSalonService`; edit page has no `createSalonWorker` / `updateSalonDnd` / `deleteSalonService`
- [ ] Services block is dense owner chrome (Cal light, hairline fields, black `rounded-md` Spremi/Dodaj, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` salon edit includes services), `05-Data-Model.md` (Service name/category/duration/feninga; no delete in this slice), `08-Decisions.md` #20 #32 #46, `docs/adr/0032-owner-salon-catalog.md`.

- [x] One React PWA. Existing Lighthouse `createSalonService` / `updateSalonService` only; no REST; no new mutation/resolver. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or a web.php route; no new files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. Eight new `owner.*` keys listed above. Integer feninga on the wire; KM only in the input. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps; Vitest on `kmToFeninga`
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + loop docs. Expected: **skip Behat**. Do not change `behat.yml`. Do not edit `CreateSalonService.php` / `UpdateSalonService.php` — verify: CONTEXT classifier at verify time; no PHP/schema/feature files in the PR diff

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

- Workers UI (STORY-55)
- Delete / hide / deactivate service
- Worker↔service assignment matrix
- Service photos, descriptions, packages
- Changing `createSalonService` / `updateSalonService` rejection rules
- DND (stays on chats); photos; coordinates; geocode
- Hours editor behavior (STORY-53)
- Add-salon / `/create-salon` services
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-54.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-54-services-on-salon-edit` from current `master`.
3. **PWA GraphQL only:** add `CREATE_SALON_SERVICE_MUTATION` and `UPDATE_SALON_SERVICE_MUTATION` next to `UPDATE_SALON_MUTATION`. Add `services { id name category durationMinutes priceFeninga }` to `ME_QUERY` `salons`. Do not touch schema, PHP, or Behat features.
4. **Helpers** `kmToFeninga` / `feningaToKm` in `owner.ts` + Vitest. Wire is feninga; input is KM.
5. **Edit page:** keep STORY-53 hours form and its Spremi. Services block **below** that form, not inside its submit. Per-row update + one add form as product checks. Radios not `<select>`. Flip `ownerSalons.source.test.ts` “no `createSalonService`” on edit only.
6. **Copy:** eight new keys only. Assert in `owner.test.ts`.
7. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-54.md` Loop to `STORY-54`.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
