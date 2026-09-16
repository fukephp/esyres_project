# Answer key: STORY-60

> Epic 7: Radno vrijeme on `/owner/salons/:id` is a one-column exclusive weekday accordion (land all collapsed).
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-60.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-60 |
| Source | `docs/stories/STORY-60.md` — Radno vrijeme exclusive accordion |
| Goal (one sentence) | Owners scan the week as seven collapsed weekday headers and open at most one day’s STORY-53 editor, without a week grid, new GraphQL, or guest hours restyle. |
| Branch name | `cursor/story-60-hours-accordion-5dc8` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-16 |

## Pass/fail — product

- [ ] `esyres_app/frontend/src/lib/owner.ts` exports `hoursAccordionSummary(day)` for `{ closed, opensAt, closesAt }` (form clocks). Closed, empty `opensAt`, or empty `closesAt` → `{ closed: true }`. Else `{ closed: false, range: `${opens.slice(0, 5)}–${closes.slice(0, 5)}` }` with Unicode en-dash `–` (same glyph as `formatAssistantHoursLine`). Ignore `breakOn` / break clocks. Do **not** call `formatAssistantHoursLine` (that appends Pauza). Reuse existing private `clock` slice via `slice(0, 5)` — verify: Vitest (`owner.test.ts`: closed; empty clocks; `09:00:00`–`17:00:00` → `09:00–17:00`; pauza fields ignored)
- [ ] `/owner/salons/:id` hours panel (`OwnerSalonEdit.tsx`): one column of seven weekday headers (`SALON_WEEKDAYS` / Mon–Sun). `ul` (keep `space-y-3` or equivalent). **No** `md:grid-cols-2` / `grid-cols-2` wrapping the week (inner Od/Do `grid-cols-2` in the open pane stays). Not a week grid (`grid-cols-7` still absent). Guest `/salon/:id` hours stay the left seven-row list (do not edit `SalonProfile.tsx` hours markup or `hoursLine`) — verify: Vitest (`ownerSalons.source.test.ts` reading `OwnerSalonEdit.tsx`: seven `weekday.${day.weekday}` headers; no week `grid-cols-2` / `md:grid-cols-2` on that `ul`; still no `grid-cols-7`; `SalonProfile.tsx` still has `hoursLine` + `flex justify-between` rows and no `openWeekday` / `hoursAccordionSummary`)
- [ ] Exclusive accordion state: `useState<string | null>(null)` named `openWeekday` (or equivalent). UI-only — no `localStorage` / `sessionStorage` / URL / `?tab=` / hash. At most one day open. Header tap: same day → `null`; other day → that weekday. Land, refresh, and leaving the Radno vrijeme chip (`setSection` to info / services / workers) → `openWeekday` is `null`. Clicking Radno vrijeme while already on hours does **not** force-collapse. No `<details>` / `<summary>` — verify: Vitest reading `OwnerSalonEdit.tsx` (`openWeekday`; `useState` null; chip handlers that are not hours set `null`; ternary or `=== day.weekday` for the pane; no `localStorage` / `sessionStorage` / `<details`; `useState<SalonEditSection>('info')` unchanged)
- [ ] Collapsed header (Q1 A / Q3 A): each day is a `type="button"` (must not submit Spremi) `flex w-full justify-between` row. Left: `t(\`weekday.${day.weekday}\`)` with `text-ink` (not muted). Right: `hoursAccordionSummary` — closed → `t('salon.closed')` + `text-muted`; open → `range` + `text-body`. No chevron, no SVG, no extra i18n keys. **Pauza is not on the header.** `salon.closed` checkbox is **not** on the collapsed header — verify: Vitest reading `OwnerSalonEdit.tsx` (header `type="button"` + `hoursAccordionSummary`; `owner.break` / pauza inputs only after the header / inside the open pane; checkbox `salon.closed` only in the open pane; no `svg` / `chevron` / `details` in the hours `ul`)
- [ ] Open pane (header tap expands only): when `openWeekday === day.weekday`, STORY-53 inner fields stay: `salon.closed` checkbox; opening a closed day still seeds `09:00`–`17:00`; not closed → Od/Do `type="time"` `step={900}`; `owner.break` checkbox seeds `12:00`–`13:00`; pauza on → two more time inputs. Closed editor still uses muted body (`text-muted` on that pane/li). `toSalonHoursInput` + Spremi still `updateSalonHours` only (hours + `cancellationNoticeHours`). Cancel notice stays **under** the day `ul`. `INVALID_HOURS` stays the form banner (`owner.INVALID_HOURS`); `onSubmitHours` does **not** set `openWeekday`. Successful save does **not** clear `openWeekday` (Q2 A). No new GraphQL — verify: Vitest (`ownerSalons.source.test.ts`: `type="time"` / `step={900}` / seed literals / `toSalonHoursInput` / `await updateSalonHours` without `await updateSalon(` in hours submit; `owner.cancellationNotice` after the hours `ul`; `onSubmitHours` slice has `INVALID_HOURS` and no `setOpenWeekday`; `graphql/auth.ts` hours mutation unchanged)
- [ ] One idle human visual: collapsed week vs one open pane; guest salon hours still a seven-row list — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner/salons/:id` Radno vrijeme one-column exclusive accordion, land all collapsed), `08-Decisions.md` #46, `docs/adr/0032-owner-salon-catalog.md`, `docs/mvp/04-UI-Design-Goals.md` (owner hours accordion).

- [ ] One React PWA. No new GraphQL / PHP / Behat / hours mutation. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [ ] i18next `bs` only. Reuse `weekday.*` / `salon.closed` / `owner.opens` / `owner.closes` / `owner.break` / `owner.cancellationNotice` / `owner.INVALID_HOURS`. No new copy keys. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `owner.test.ts` existing i18n asserts still pass; `esyres_app/frontend/package.json` unchanged deps
- [ ] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + loop docs. Expected: **skip Behat**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

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

## Out of scope

- Two-column days; independent multi-open collapse
- Copy-week / apply Monday to all / Isti sati master
- Persist which weekday is open
- Sticky or separate cancel-notice card
- Holidays; per-worker hours; days-only editor
- Guest hours restyle (STORY-59 seven-row list stays)
- Chevron / disclosure icon
- Auto-expand on `INVALID_HOURS`
- New GraphQL
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-60.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0032-owner-salon-catalog.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `cursor/story-60-hours-accordion-5dc8` from current `master` (already created for this loop).
3. **Helper:** `hoursAccordionSummary` in `owner.ts` + `owner.test.ts` cases above. Do not reuse `formatAssistantHoursLine`.
4. **Edit page only:** `openWeekday` accordion on the hours panel. Move Zatvoreno + Od/Do/Pauza into the open pane. Guest `SalonProfile` hours untouched. Chip leave → collapse. Save / hours error → keep open day.
5. **Copy:** no new keys. Assert existing hours i18n still in `owner.test.ts`.
6. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-60.md` Loop to `STORY-60`.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
