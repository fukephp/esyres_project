# Answer key: STORY-82

> Epic 3: skeleton loading on every page and list; ghost OwnerShell while owner routes load. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-82 |
| Source | `docs/stories/STORY-82.md` — Skeleton loading |
| Goal (one sentence) | Every bare `Učitavanje…` on a page or list becomes a Design 2 skeleton shaped like the content it stands in for, and `/owner*` routes load inside a ghost `OwnerShell`. |
| Branch name | `story/STORY-82-skeleton-loading` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-29 |

## Pass/fail — product

- [ ] One shared `components/Skeleton.tsx` (no new dependency). Blocks use `bg-surface-card` (dark variant `bg-surface-dark-elevated`), `motion-safe:animate-pulse` (static under reduced motion), no shadow, no pastel status class. The wrapper is `role="status"` + `aria-busy="true"` with an sr-only `t('salon.loading')`. It renders nothing visible until ~150ms (`SKELETON_DELAY_MS = 150`), then the blocks — verify: Vitest `skeleton.source.test.ts` (new)
- [ ] No page or list still renders a bare `<p>…{t('salon.loading')}</p>` / `{i18n.t('salon.loading')}` loading paragraph. Covered: `App.tsx` Suspense fallbacks, `DiscoveryHome`, `SalonProfile`, `MyBookings`, `CreateSalon`, `Homepage` (Popularno strip), `OwnerHome` (page + Kalendar week + pending pile + Kanban), `OwnerZapisi`, `OwnerChats`, `OwnerStats`, `OwnerSalons`, `OwnerSalonCreate`, `OwnerSalonEdit`, `OwnerSettings`, `OwnerRequestDetail`, `OwnerPhoneBooking` (Telefon slot pills). `salon.loading` stays only inside `Skeleton` (and mutation-button text is unchanged) — verify: Vitest `skeleton.source.test.ts` (scan of those files)
- [ ] Guest page loading keeps `<TopNav` plus the guest column and a page-shaped preset (`/salons` rows, `/salon/:id` name + address + seven weekday rows + service groups, `/bookings` cards, `/create-salon` form) — verify: Vitest `skeleton.source.test.ts` and existing `topNav.source.test.ts` green
- [ ] `/owner*` Suspense fallback and `me`-loading state render a ghost `OwnerShell` (black sidebar `md+` / black bottom tab bar on phone) with pulsing bars for nav links, greeting, and salon switcher; the ghost contains no `<Link`, `<a `, `<button`, or `<select`. After `me` lands, logged-out / unverified / not-an-owner still render `<TopNav` (STORY-78 gate states otherwise unchanged) — verify: Vitest `skeleton.source.test.ts` and existing `topNav.source.test.ts` (update its owner list only if the ghost changes what it scans)
- [ ] Owner presets: Kalendar = seven day columns of `rounded-2xl` ghosts (phone: chips + one day) + pending pile; Kanban = four columns; Zapisi / Chats = rows; Statistika = tiles; `/owner/salons` = two hairline boxes; salon edit = chip row + one panel; Request Detail = Nazad bar + one bare block (no Cal card class) — verify: Vitest `skeleton.source.test.ts`
- [ ] Homepage Popularno u Sarajevu: four `SalonCard`-shaped ghosts while the query loads; section still hidden when the result is empty — verify: Vitest `homepageSections.source.test.ts` (extend)
- [ ] Unchanged: salon profile busy keep-last on day change (no skeleton there), picker and chat overlays never swap to a skeleton, save buttons keep their in-progress labels — verify: existing `salonProfile.source.test.ts`, `salonSend.test.ts`, `ownerSettings.source.test.ts`, `phoneBooking.source.test.ts` green
- [ ] Look and feel on a slow network (pulse, no layout jump when data lands, ghost shell matches the real shell) — verify: human-only: at merge, throttle to Slow 3G and open `/salons`, `/salon/:id`, `/owner`

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (one React TypeScript PWA; Design 2 tokens via Tailwind).

- [ ] One React PWA; no new npm dependency; no Apollo cache / fetch-policy change; no REST, GraphQL, schema, or PHP change — verify: `git diff --name-only master...HEAD` has no paths under `esyres_app/` outside `esyres_app/frontend/`, and `esyres_app/frontend/package.json` dependencies unchanged
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

- Shimmer, spinners, full-page overlays, optimistic UI
- Apollo cache, prefetch, or fetch-policy changes; backend changes
- Mutation button in-progress labels
- Salon busy badge day-change behavior; picker / chat overlay loading
- Image placeholders (profile stays photoless)
- Re-layout of any loaded page

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-82.md`, root `DESIGN.md`, `refs/design-2/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-82-skeleton-loading` from current `master`.
3. `components/Skeleton.tsx`: export `SKELETON_DELAY_MS = 150`, a `Skeleton` wrapper (status role, `aria-busy`, sr-only `salon.loading`, `useState` + `setTimeout` delay, cleared on unmount), a `SkeletonBlock` (className passthrough; `dark` prop swaps fill), and small page presets (in the same file or `components/skeletons/`). Keep it plain; no context or provider.
4. Ghost shell: an `OwnerShellGhost` (or `OwnerShell` `ghost` prop) that reuses the real shell's layout classes so dimensions match, with `SkeletonBlock dark` in place of links/greeting/switcher and no interactive elements. Use it for every owner `Suspense` fallback in `App.tsx` and each owner page's `me`-loading branch.
5. Replace each section-level loading paragraph with the matching preset in the same spot. Keep existing loading conditions (e.g. `listLoading && listData === undefined`) as-is.
6. Homepage: read `loading` from the popular query; render four ghost cards while loading; keep hide-when-empty.
7. Add a `Skeleton` row to the components table in `refs/design-2/DESIGN.md`.
8. Add `lib/skeleton.source.test.ts` for the checks above; extend `homepageSections.source.test.ts`; adjust existing source tests only where they asserted the old `<p>` loading markup.
9. Set Loop to `STORY-82` on `docs/stories/STORY-82.md` and `docs/stories/index.md`.
10. Loop: implement → classifier → matching verify (expected host npm from `esyres_app/frontend/`) → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
12. After PR: Bugbot; nits on the same PR. If Bugbot contradicts this key, stop and ask.
