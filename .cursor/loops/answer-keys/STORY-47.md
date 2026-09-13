# Answer key: STORY-47

> Epic 1: salon profile address line, idle header `Pošalji zahtjev`, tappable open hours that seed the picker.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-47.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-47 |
| Source | `docs/stories/STORY-47.md` — Salon profile address, header CTA, tappable hours |
| Goal (one sentence) | `/salon/:id` shows a trimmed address when set, an idle header send button under the title, and tappable open-hour rows that seed the picker’s next Sarajevo date — still one guest column, no rail. |
| Branch name | `cursor/story-47-salon-profile-hours-6adc` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk Hopic / 2026-09-13 |

## Pass/fail — product

- [x] Pure helpers in `esyres_app/frontend/src/lib/salonHours.ts` (do not import `owner.ts`): `nextSarajevoDateForWeekday(weekday, today)` uses the same UTC-noon + `Europe/Sarajevo` weekday as `assistantHoursForDate` / `sarajevoWeekday`. Inclusive: 2026-09-13 (Sunday) → Sunday `2026-09-13`, Monday `2026-09-14`, Saturday `2026-09-19`. No clock argument; do not +7 after today’s close. `hoursRowClosed(day)` is true when `assistantHoursFacts(day)` is `{ closed: true }` or `null`. `hoursRowTappable({ closed, hasServices, mode })` is true only when `!closed && hasServices && (mode === 'idle' \|\| mode === 'picker' \|\| mode === 'chat')`. `hoursRowSelected({ tappable, rowWeekday, preferredDate })` is true only when tappable, `preferredDate !== ''`, and Sarajevo weekday of `preferredDate` equals `rowWeekday` (next-week Monday still selects Monday). `applyHoursRowTap`: not tappable or already selected → `{ noop: true }`; else `{ mode: 'picker', preferredDate: nextSarajevoDateForWeekday(...), preferredTime: unchanged, scroll: true }` — verify: Vitest (`esyres_app/frontend/src/lib/salonHours.test.ts`)
- [x] `index.css` `@theme` has `--color-surface-soft: #f8f9fa` (Design 1). Hours selected + tappable hover/focus use `bg-surface-soft`. No extra busy/cell colors on hours. No chip strip, no `md:grid-cols-2`, no right rail — verify: Vitest (`designPack.test.ts` hex; source read of `SalonProfile.tsx`)
- [x] `/salon/:id` stack in `SalonProfile.tsx` (happy path): (1) title + today’s busy, (2) address line if omit-helper keeps it, (3) header `salon.send` when idle and `salon.services.length > 0`, (4) `salon.hours` heading + seven weekday rows, (5) services, (6) lower `salon.send` + `assistant.ask` when those already show today. Name, busy, address, hours, services span the guest column. Header send, lower send, chat alternate, picker `<form>`, and `AssistantIntake` stay in left-aligned `max-w-md` (no `mx-auto` on that measure). Header send uses the same ink-pill classes as the lower send (`w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas`) — verify: Vitest reading `SalonProfile.tsx`
- [x] Address: call `assistantAddressLine(salon.address)` (same omit as discovery). Render only when non-null: `<p className="… text-sm text-muted">` with that string. No `Adresa` heading, no maps `http`/`maps`, no lat/lng. `PUBLIC_SALON_QUERY` already selects `address`; do not add fields — verify: Vitest reading `SalonProfile.tsx` + existing `assistant.test.ts` omit cases
- [x] Header `Pošalji zahtjev` calls today’s `openIntake('picker')` (do not write date/time). Hidden while `picking`, `chatting`, `sent`, or no services. Lower send stays `hasServices && !picking && !sent` (still visible during chat). `assistant.ask` stays `showChatCta && !chatting`. No sticky bar — verify: Vitest reading `SalonProfile.tsx`
- [x] Hours: keep `h2` `salon.hours`. Seven `<li>` keyed by `day.weekday`. Closed: muted text (`text-muted`), not a `<button>`, no `onClick` that opens picker or writes date. Open + tappable: whole-row `<button type="button">` (weekday left, `hoursLine` right). Open + not tappable (no services or `sent`): not a button. Selected open row (and tappable hover/focus): `bg-surface-soft`. Re-tap of selected → `applyHoursRowTap` noop (keep their `preferredDate`, even next week) — verify: Vitest (`salonHours.test.ts` + reading `SalonProfile.tsx`)
- [x] Hours tap (non-noop): `setMode('picker')`, set picker `preferredDate` from the helper (from `sarajevoToday()`, not from `preferredDate` / `chatDate`), do not write `preferredTime` (idle stays `''`; picker keeps typed time). Native date `input` still `onChange` → `setPreferredDate`. Chat tap: do not copy `chatSelected` / `chatWorker` / `chatDate` / `chatTime` into the picker; do not `clearIntakeToken`, do not change `intakeToken`, do not call `onPing` / `pingIntake` — verify: Vitest reading `SalonProfile.tsx` (handler uses `applyHoursRowTap`; chat fields / token / ping absent from that path)
- [x] After header CTA, or an hours tap with `scroll: true`, scroll the picker `<form>` into view once it is mounted (ref + effect; idle→picker and chat→picker have no form yet). Chat alternate click does not scroll. Noop re-tap does not scroll. `scrollIntoView` only, no sticky — verify: Vitest reading `SalonProfile.tsx`
- [x] Send gates, busy badge, services list, `createBooking`, chat copy, and `AssistantIntake` props stay as today except the profile stack/hours/header above — verify: Vitest reading `SalonProfile.tsx`; no new GraphQL mutations
- [ ] Address, header send, and tappable hours read as one column (no rail); closed rows stay muted — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (salon profile address, header send, in-column hours), `05-Data-Model.md` (address text, not maps), `08-Decisions.md` #42, `docs/glossary.md` **Address** / **Salon profile** / **Working hours**.

- [x] One React PWA. No new GraphQL fields, REST, or booking mutations. Guest still reads existing public `salon.address`. No owner address editor, lat/lng UI, or maps SDK — verify: no new schema/feature/PHP files this PR; `PUBLIC_SALON_QUERY` still has `address` and not `cancellationNoticeHours`; `test ! -d esyres_app/marketing`
- [x] i18next `bs` only. No new copy keys (reuse `salon.send`, `salon.hours`, `salon.closed`, `weekday.*`, `assistant.ask`). No Playwright, RTL, Pest, GraphQL codegen, or new npm — verify: `esyres_app/frontend/package.json` unchanged deps; `i18n.ts` has no new `salon.` / `discovery.` keys this PR
- [x] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml`. Do not seed demo addresses — verify: CONTEXT classifier at verify time; no `features/` or `database/seeders` edits this PR

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + CSS + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

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

**This PR (2026-09-13):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Host npm from `esyres_app/frontend/`.

Passed:

```text
test ! -d esyres_app/marketing
npm run typecheck
npm run test
npm run build
```

145 tests passed.

## Out of scope

- Photo, gallery, description
- Nearby / same-location substitute strip
- Favorite / like UI
- Meet the team / worker bios
- Guest benefits notice
- Two-column salon or right schedule rail
- Maps link-out, lat/lng, owner address editor (STORY-41)
- Seeding address on demo salons
- Week chips, slot grid, sticky top-nav
- Hiding the lower `Pošalji zahtjev` during chat (keep today’s rule)
- New i18n keys
- Awwwards / GSAP / Three.js
- Public pricing page
- Playwright, RTL, Pest, GraphQL codegen, new npm
- Changing send gates, `createBooking`, busy badge, or assistant copy

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-47.md`, `docs/glossary.md` (Address, Salon profile, Working hours), `docs/architecture/04-Frontend.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `cursor/story-47-salon-profile-hours-6adc` from current `master`.
3. **Helpers:** add `esyres_app/frontend/src/lib/salonHours.ts` + `salonHours.test.ts` as in the first product check. Reuse `assistantHoursFacts` and `ProfileMode` from `assistant.ts`. Duplicate the UTC-noon weekday format locally or share a tiny helper in this new file; do not import `owner.ts`. Do not +7 after close.
4. **Token:** `--color-surface-soft: #f8f9fa` in `esyres_app/frontend/src/index.css` `@theme`. Assert the hex in `designPack.test.ts`.
5. **SalonProfile stack:** after the name/busy header, render the address line, then a left `max-w-md` header send (idle + has services), then hours, then services, then the existing lower `max-w-md` block (lower send, chat alternate, picker, assistant). Do not wrap hours/services in `max-w-md`. Keep `GUEST_COLUMN_CLASS` on every `<main>`.
6. **Header send:** same ink-pill classes as lower `salon.send`. `onClick` → `openIntake('picker')` + request picker scroll. Hide when picking / chatting / sent / no services.
7. **Hours rows:** keep `salon.hours` heading. Map `salon.hours` to seven rows. Closed: `text-muted`, not a button. Tappable open: whole-row `type="button"` calling `applyHoursRowTap` with `sarajevoToday()`, current picker `mode` / `preferredDate` / `preferredTime`. Apply returned state only; never assign chat snapshot fields or touch intake token/ping on that path. Selected + hover/focus: `bg-surface-soft`.
8. **Scroll:** `useRef` on the picker `<form>`. Flag + `useEffect` so `scrollIntoView` runs after `mode === 'picker'` mounts the form. Header CTA and `scroll: true` hours taps set the flag. `openIntake('chat')` does not. Noop taps do not.
9. **Vitest:** helper tests above; source-read tests for stack order, address omit, header vs lower send visibility, hours button vs muted, `applyHoursRowTap`, scroll effect, no `md:grid-cols-2`, `bg-surface-soft`. Keep `designPack.test.ts` / `authPlace.source.test.ts` / `topNav.source.test.ts` green.
10. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-47.md` Loop to `STORY-47`.
11. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
12. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
