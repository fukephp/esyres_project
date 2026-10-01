# Answer key: STORY-85

> Epic 3: elapsed-share bar on confirmed Zahtjevi cards, and an icon-only OwnerShell menu. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-85 |
| Source | `docs/stories/STORY-85.md` — Zahtjevi progress and icon menu |
| Goal (one sentence) | Confirmed Zahtjevi cards show how far the occupied range has run, and every owner route uses a narrow icon rail instead of a labeled sidebar. |
| Branch name | `story/STORY-85-zahtjevi-progress-icon-menu` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | user / 2026-10-01 |

## Pass/fail — product

- [ ] `occupiedElapsedShare(date, startHHmm, durationMinutes, now)` uses the Sarajevo clock. Returns 0 at and before the start, 1 at and after the end, and the fraction in between. A booking on a later Sarajevo day is 0; on an earlier day is 1 — verify: Vitest `owner.test.ts`
- [ ] Zahtjevi Kalendar confirmed cards and Zahtjevi Kanban confirmed cards (Potvrđeno and past confirmed in Završeno i otkazano) render a `role="progressbar"` track at the bottom of the card (`aria-valuemin={0}` `aria-valuemax={100}` `aria-valuenow` rounded percent, no visible percent). Fill width is that share. Pending, `TIME_PROPOSED`, declined, and cancelled cards have no progressbar. Zapisi `BookingCard` uses have no progressbar. Request Detail and the homepage mock have no progressbar — verify: Vitest `ownerPanel.source.test.ts` (extend) and `homepageSections.source.test.ts` still green
- [ ] The share uses the same occupied start and duration the card already shows (`occupyingBlock` / confirmed preferred start). It does not read `rescheduleStartsAt`. Zahtjevi passes a `now` that recomputes on a 60s interval while that page is mounted; the bar width has no CSS transition — verify: Vitest `ownerPanel.source.test.ts`
- [ ] `md+` `OwnerShell` aside is a narrow rail (not `md:w-60`): mark links to `/` with no brand wordmark, `OwnerNav` `variant="sidebar"` is six outline `<svg>` icons in today’s order (Zahtjevi, Zapisi, Chats, Statistika, Saloni, Postavke), active link stays the canvas pill, Chats still renders the count badge, each link has `aria-label` and `title` from the existing `t(...)` label. Icon Odjava is `bg-error-strong` with `aria-label` `t('home.logout')` and no visible Odjava word. The rail has no `<select`. Salon switcher or salon name is on the greeting row before `{action}` — verify: Vitest `topNav.source.test.ts` and `ownerSalons.source.test.ts` (update the shell assertions)
- [ ] Phone header is unchanged: brand, `SalonSwitcher`, Statistika text link, text Odjava pill (`bg-error-strong` + `t('home.logout')`). Phone `variant="tabs"` renders the same five icons (no Statistika), no visible label text, `aria-label` from the existing label, Chats count badge stays — verify: Vitest `topNav.source.test.ts`
- [ ] Ghost `OwnerShell` uses the same narrow rail width class as the live aside and icon-sized placeholders for the tabs. Still no `<Link`, `<a `, `<button`, or `<select` — verify: Vitest `skeleton.source.test.ts` (replace the `md:w-60` assertion)
- [ ] Logged-out, unverified, and not-an-owner owner routes still render `<TopNav` — verify: existing `topNav.source.test.ts` green
- [ ] Icon metaphors (calendar, list, speech bubble, bar chart, shop, gear, exit) and the ink-on-soft track read on the pastel cards — verify: human-only: at merge

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (one React TypeScript PWA; no new UI library).

- [ ] One React PWA; no new npm dependency; no GraphQL, schema, or PHP change — verify: `git diff --name-only master...HEAD` has no paths under `esyres_app/` outside `esyres_app/frontend/`, and `esyres_app/frontend/package.json` dependencies unchanged
- [ ] Classifier: frontend + `docs/` + `refs/` + `.cursor/` only → **Behat skipped**. Do not `compose up` or run `php artisan --version`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo's default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **frontend-only**.

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

- A stored progress field, a percent label, a now-line, drag, or a 15-minute board
- A rail that expands, a floating dock, or icons on guest TopNav
- Zapisi, Request Detail, and the homepage Zahtjevi mock
- Backend, GraphQL, or schema changes

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-85.md`, root `DESIGN.md`, `refs/design-2/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-85-zahtjevi-progress-icon-menu` from current `master`.
3. Add `occupiedElapsedShare` next to `sarajevoNowMinutes` / `occupyingBlock`. Pure. No `setInterval` inside the helper.
4. `OccupyingCard`: progressbar only when `row.status === 'CONFIRMED'`. `BookingCard`: progressbar only when a `progress` prop is passed (Zahtjevi Kanban confirmed rows). Do not pass it from Zapisi. Track is a soft bar (`bg-ink/15`), fill `bg-ink`, full content width, bottom of the card, `h-1`, no `transition`.
5. `OwnerHome` holds `now` state, refreshes it every 60s while mounted, and passes it into the share. Week grid still has no now-line.
6. `OwnerNav`: inline outline SVGs, `currentColor`, `aria-hidden` on the svg, accessible name on the link. Sidebar: `title={label}`. Tabs: no visible label node. Keep paths, badge, and active pill.
7. `OwnerShell`: drop `md:w-60`. Rail is `md:w-16`. Move `SalonSwitcher` out of the aside onto the greeting row before `{action}`. Phone header stays. `md+` Odjava is icon-only; phone Odjava stays the text pill. Ghost shell copies the new rail width and drops `md:w-60`.
8. Update source tests that assert `md:w-60` or a wordmark in the aside. Do not weaken the TopNav guest-gate tests.
9. Loop: implement → CONTEXT frontend-only classifier → matching verify → fix. Cap 8. Open a PR on pass. Draft/blocked on escalate.
