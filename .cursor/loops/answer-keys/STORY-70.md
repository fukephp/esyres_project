# Answer key: STORY-70

> Epic 3: `/owner/requests/:id` uses the same Cal card as Zahtjevi. Chrome only. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-70 |
| Source | `docs/stories/STORY-70.md` — Request Detail Cal card |
| Goal (one sentence) | Request Detail sits in one Zahtjevi Cal card (Nazad above it) so counter-propose is not a bare `max-w-xl` column. |
| Branch name | `story/STORY-70-request-detail-cal-card` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-27 |

## Pass/fail — product

- [ ] Owner-ready `/owner/requests/:id` keeps TopNav, aside + `OwnerNav` `active="queue"`, phone `h1` `owner.title` + salon name + `OwnerNav` all `md:hidden`. No salon switcher (`t('owner.salon')` / `onSalon`). No `?salon=`. Auth, email-verify, not-owner, and loading returns stay uncarded (`AuthShell` / `EmailVerifyPanel` / `owner.notOwner` / `salon.loading` have no `rounded-lg border border-hairline bg-canvas p-4`) — verify: Vitest `ownerSalons.source.test.ts` (OwnerNav, no `owner.salon` / `onSalon`); `ownerPanel.source.test.ts` + `topNav.source.test.ts` (TopNav, `min-h-svh md:flex`, no guest column); source slice of `OwnerRequestDetail.tsx` before the owner-ready `<main` has no that card class
- [ ] Owner-ready `<main className="flex-1 px-5 py-8">` (same as `OwnerHome`). Drop `max-w-xl` on that main. **Nazad** (`owner.back` link) is above one card `rounded-lg border border-hairline bg-canvas p-4`. No `shadow-` on the page. No `md:grid` / `md:grid-cols-2`. Not a salon-edit ink panel (`rounded-md bg-ink` as the page panel) — verify: Vitest `ownerPanel.source.test.ts` (`owner.back` index < card class; card class once; main `flex-1 px-5 py-8`; no `max-w-xl` / `shadow-` / `md:grid` on `OwnerRequestDetail.tsx`)
- [ ] Form, read, and bounce share that card. `forbidden` or `booking === undefined`: card contains only `owner.acceptError.NOT_REQUESTED` (no `customerName`, no `PriorMemory`, no propose/accept/decline). Loaded bounce (`declined` / `cancelled`): `customerName`, then `formatSarajevoTime(preferredStartsAt)`, then the existing meta line (date · services · duration · worker), then `NOT_REQUESTED`. No `PriorMemory`, no `<form`, no `owner.propose` / `owner.accept` / `owner.decline` in that branch — verify: Vitest source (those three branches; bounce-loaded has `customerName` before `formatSarajevoTime(booking.preferredStartsAt)` and `NOT_REQUESTED`; forbidden/missing slice has no `customerName`)
- [ ] Form (`requested`): in-card order is `customerName`, then `formatSarajevoTime(booking.preferredStartsAt)`, then existing meta, then `PriorMemory`, then Asistent + collapsed transcript when `assistantOriginVisible`, then `owner.noWorkers` / `owner.closedDay` or the propose `<form` (`PROPOSE_TIME_MUTATION`), then Prihvati (`canAcceptPreferredTime` + `ACCEPT_PREFERRED_TIME_MUTATION`) and Odbi two-step (`DECLINE_BOOKING_MUTATION`). Read (`confirmed` / `time_proposed`): `customerName`, then `occupyingClockRange`, then meta, then `PriorMemory`, then `bookings.status.TIME_PROPOSED` when that status. Read has no propose/accept/decline — verify: Vitest `ownerPanel.source.test.ts` (`ownerDetailMode`, `proposedStartsAt`, `OCCUPYING_BOOKINGS_QUERY`, no `OCCUPYING_BOOKINGS_RANGE_QUERY`, `PROPOSE_TIME_MUTATION`, `MARK_NO_SHOW_MUTATION`, `priorConfirmedBookings`, `owner.priorBookings`, `owner.noShow`; form slice `customerName` before `formatSarajevoTime`; read slice `customerName` before `occupyingClockRange` and no `owner.propose`)
- [ ] Predloži on pending and occupying row tap still go to `/owner/requests/:id`. Do not edit `OwnerHome.tsx` — verify: existing `ownerPanel.source.test.ts` home assertions still match (`/owner/requests/` on `OwnerHome.tsx`)
- [ ] Mutations and `ownerBooking` selection stay. No new i18n keys. `PriorMemory` stays (STORY-72) inside the card on form and read only — verify: Vitest source (`pending.ts` `OWNER_BOOKING_QUERY` still selects `priorConfirmedBookings` and `noShowAt`; `i18n.ts` has no new `owner.*` keys beyond what `master` has — `owner.back` / `owner.acceptError.NOT_REQUESTED` / `owner.priorBookings` / `owner.priorEmpty` / `owner.noShow` unchanged)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (proposeTime from Request Detail), `04-Frontend.md` (owner overlay; Zahtjevi card), `docs/glossary.md` Request Detail, `docs/adr/0035-zahtjevi-month-and-selected-day-list.md`, `docs/mvp/04-UI-Design-Goals.md`, `refs/design-1/DESIGN.md`.

- [ ] One React PWA. No PHP, GraphQL schema, Behat, or npm changes. No `esyres_app/marketing`. No Pest / Playwright / codegen — verify: diff under `esyres_app/` is only `esyres_app/frontend/`; `test ! -d esyres_app/marketing`; `package.json` deps unchanged
- [ ] Bosnian copy reused (`bs` only). Owner overlay inner stays unconstrained (`flex-1`, not `GUEST_COLUMN_CLASS`). Route stays `/owner/requests/:id` — verify: Vitest (`OwnerRequestDetail.tsx` no `GUEST_COLUMN_CLASS`; `App.tsx` path unchanged)
- [ ] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is frontend chrome (+ story Loop slug under `docs/stories/`, which does not trigger Behat). Expected: **frontend-only**. If any other `esyres_app/` path appears, Behat runs. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **frontend-only** (no PHP / schema / features).

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

- Chats, stats, salon catalog / edit chrome
- Customer phone / email; occupying list on this page; WorkerPanel / drag
- Changing `acceptPreferredTime` / `proposeTime` / `declineBooking` / `markNoShow` contracts or `ownerBooking` fields
- `?salon=` on this URL
- Guest picker chrome
- Removing or restyling STORY-72 prior-bookings / no-show (keep them; only move them inside the card on form and read)
- A new radius token (reuse Zahtjevi’s `rounded-lg` class string)
- Homepage, discovery, salon profile

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-70.md`, `docs/glossary.md` (Request Detail), `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-70-request-detail-cal-card` from current `master`.
3. Edit `OwnerRequestDetail.tsx` only for chrome: owner-ready main matches `OwnerHome` (`flex-1 px-5 py-8`). Nazad, then one card with the class string `rounded-lg border border-hairline bg-canvas p-4`. Move form / read / bounce into that card. Split forbidden-or-missing from loaded bounce. Swap heading to name then that mode’s clock. Leave `PriorMemory` on form and read, under meta, inside the card. Do not change pills, mutations, or queries.
4. Update `ownerPanel.source.test.ts` for the card, Nazad-before-card, no `max-w-xl`, and heading order. Do not weaken the existing form/read/bounce or home-link assertions.
5. Set Loop to `STORY-70` on `docs/stories/STORY-70.md` and `docs/stories/index.md`.
6. Loop: implement → classifier → matching verify (expected host npm from `esyres_app/frontend/`) → fix. Cap 8. Same failure twice → escalate.
7. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
8. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
