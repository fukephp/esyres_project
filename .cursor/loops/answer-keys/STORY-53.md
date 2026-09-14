# Answer key: STORY-53

> Epic 7: weekly hours + cancel window on `/owner/salons/:id`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-53.md` and the story-loop grill (Q1 / Q2 / Q3 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-53 |
| Source | `docs/stories/STORY-53.md` — Hours on salon edit |
| Goal (one sentence) | Owners edit the STORY-01 weekly template and cancel window on salon edit via existing `updateSalonHours`, so catalog open-now matches that shop. |
| Branch name | `story/STORY-53-hours-on-salon-edit` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-14 |

## Pass/fail — product

- [x] `UPDATE_SALON_HOURS_MUTATION` is `updateSalonHours(salonId: ID!, input: UpdateSalonHoursInput!)` returning `id` + `hours { weekday closed opensAt closesAt breakStartsAt breakEndsAt }` + `cancellationNoticeHours`. No new GraphQL field or PHP mutation — verify: Vitest reading `graphql/auth.ts` (or the owner GraphQL module that already holds `UPDATE_SALON_MUTATION`); `git diff` of this PR has no files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] `ME_QUERY` `salons` adds existing `cancellationNoticeHours`. `MeData.salons` includes `cancellationNoticeHours: number`. Hours fields stay as today — verify: Vitest reading `graphql/auth.ts` + `MeData`
- [x] Helper `toSalonHoursInput(days)` (name may match this intent) in `owner.ts`: always 7 weekdays `MONDAY`…`SUNDAY`; closed day → `closed: true` and all four times `null`; open day → `opensAt`/`closesAt` as `HH:MM` (strip seconds if a `type=time` value has them); pauza off → break times `null`; pauza on → `breakStartsAt`/`breakEndsAt`. Do not send times on a closed day — verify: Vitest (`owner.test.ts`)
- [x] i18n `bs` only these new keys: `owner.opens` `Od`; `owner.closes` `Do`; `owner.break` `Pauza`; `owner.cancellationNotice` `Rok za otkaz (sati)`; `owner.INVALID_HOURS` `Radno vrijeme nije ispravno.` Reuse `salon.hours` `Radno vrijeme`; `salon.closed` `Zatvoreno`; `weekday.*`; `owner.save` / `owner.INVALID_NAME` / `owner.INVALID_ADDRESS` / `owner.FORBIDDEN`. No `<select>` keys — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] `/owner/salons/:id` (`OwnerSalonEdit.tsx`): same overlay + name/address fields as STORY-51 (both still required). Below them, heading `salon.hours`; seven weekday rows (`t('weekday.${weekday}')`) each with `salon.closed` checkbox; when not closed, two `type="time" step={900}` inputs labeled `owner.opens` / `owner.closes` and an `owner.break` checkbox; pauza on → two more `type="time" step={900}` (no `<select>`). Then `owner.cancellationNotice` `type="number"` (integer hours, seed from `me.salons[].cancellationNoticeHours`, default 24 if missing). One `owner.save` — verify: Vitest reading `OwnerSalonEdit.tsx` (flip STORY-51/52 “no `updateSalonHours`” on this page only; create-salon / add-salon pages still have no hours UI)
- [x] Opening a closed day with empty clocks seeds `09:00`–`17:00`. Enabling pauza with empty break clocks seeds `12:00`–`13:00`. Closed stays muted (no time inputs). Name + address stay on this screen — verify: Vitest reading the page (seed literals `09:00` / `17:00` / `12:00` / `13:00` present; closed hides times)
- [x] One Spremi: `updateSalon` (trimmed name+address) first; on success `updateSalonHours` with `toSalonHoursInput` + `cancellationNoticeHours` as int; then refetch `Me`. Name fail → do not call hours; map `INVALID_NAME` / `INVALID_ADDRESS` as today. Hours fail → `INVALID_HOURS` → `owner.INVALID_HOURS`; other codes → `salon.gate.fallback`. Stay on the page. Catalog open-now uses existing `salonIsOpenNow` on refetched `me.salons[].hours` (no new openNow field) — verify: Vitest reading `OwnerSalonEdit.tsx` (call order + error maps); `OwnerSalons.tsx` still `salonIsOpenNow`
- [x] `CreateSalon.tsx` and `OwnerSalonCreate.tsx` unchanged (no hours UI). No services, workers, DND, photos, coords, reschedule cap, holiday calendar, or days-only editor — verify: Vitest reading those two pages still have no `updateSalonHours`; edit page has no `createSalonService` / `createSalonWorker` / `updateSalonDnd`
- [ ] Hours editor is dense owner chrome (Cal light, hairline fields, one black `rounded-md` Spremi, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` salon edit includes weekly hours), `05-Data-Model.md` (hours + `cancellation_notice_hours`; `updateSalon` stays name+address), `08-Decisions.md` #34 #46, `docs/adr/0032-owner-salon-catalog.md`.

- [x] One React PWA. Existing Lighthouse `updateSalonHours` only; no REST; no new mutation/resolver. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or a web.php route; no new files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. Five new `owner.*` keys listed above. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + loop docs. Expected: **skip Behat**. Do not change `behat.yml`. Do not edit `UpdateSalonHours.php` — verify: CONTEXT classifier at verify time; no PHP/schema/feature files in the PR diff

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

172 Vitest tests passed.

## Out of scope

- Services UI (STORY-54)
- Workers UI (STORY-55)
- Days-only editor; holiday calendar; reschedule cap UI
- Changing `updateSalonHours` rejection rules or adding a new mutation
- DND (stays on chats); photos; coordinates; geocode
- Delete / deactivate salon
- Listed-on-discovery (still needs a service)
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-53.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-53-hours-on-salon-edit` from current `master`.
3. **PWA GraphQL only:** add `UPDATE_SALON_HOURS_MUTATION` next to `UPDATE_SALON_MUTATION`. Add `cancellationNoticeHours` to `ME_QUERY` `salons`. Do not touch schema, PHP, or Behat features.
4. **Payload helper** in `owner.ts` + Vitest. Closed days must not send clock strings (server `INVALID_HOURS` if they do).
5. **Edit page:** keep STORY-51 shells and name/address. Hours block + cancel window + one Spremi as product checks. Time inputs match picker (`type="time"` `step={900}`). No `<select>`. Flip `ownerSalons.source.test.ts` “no hours UI” on edit only.
6. **Copy:** five new keys only. Assert in `owner.test.ts`.
7. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-53.md` Loop to `STORY-53`.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
