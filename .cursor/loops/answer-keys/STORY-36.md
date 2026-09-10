# Answer key: STORY-36

> Epic 9: owner Basic Stats for the selected salon (week counts, busy percent, cancellation rate). Not QR.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-36.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-36 |
| Source | `docs/stories/STORY-36.md` — Basic stats |
| Goal (one sentence) | A verified owner can open `/owner/stats` for the selected salon and see last-7-day bookings count, a 7-day busy-percent strip, busiest start-hours, cancellation rate, and late-cancel count; customers never see this screen. |
| Branch name | `cursor/story-36-basic-stats-ff6a` |
| Iteration cap | 8 |
| Status | draft |
| Approved by / date | |

## Pass/fail — product

- [ ] `salonStats(salonId)` with Behat now `2026-08-29 09:00` Europe/Sarajevo → `fromDate=2026-08-23`, `toDate=2026-08-29`, `days` length 7 oldest→today (`days[0].date=2026-08-23`, `days[6].date=2026-08-29`), each `weekday` matches that date — verify: Behat (`features/owner/salon_stats.feature`)
- [ ] Empty owned salon: `bookingsCount=0`, `cancellationRatePercent=0`, `lateCancels=0`, every `days[].bookingsCount=0`, `hours=[]` — verify: Behat
- [ ] Count includes `confirmed` and `cancelled` whose `preferred_date` is in `[fromDate, toDate]`; excludes `requested`, `time_proposed`, `declined`; excludes rows whose `preferred_date` is `2026-08-22` or `2026-08-30`; other salon’s rows excluded — verify: Behat
- [ ] `cancellationRatePercent` = `intdiv(cancelled * 100, confirmed + cancelled)` in that window (same status set); denominator 0 → 0. Example: 2 confirmed + 1 cancelled → `33`. `lateCancels` = count of those cancelled rows with `late_cancel` true (snapshot; do not recompute) — verify: Behat
- [ ] Each `days[].busyPercent` = `Occupancy::percent` for that date (requested + time_proposed + confirmed minutes / open minutes, cancelled excluded). Example: Saturday open 09:00–17:00 (480 min) + one 120-min `requested` on 2026-08-29 → that day’s `bookingsCount=0` and `busyPercent=25` — verify: Behat
- [ ] `hours`: Sarajevo hour-of-day (`0–23`) of `preferred_starts_at` for confirmed+cancelled in the window; omit count 0; sort count desc then hour asc; duration does not spill. Example: two starts at 11:00 and one at 14:00 → `[{hour:11,bookingsCount:2},{hour:14,bookingsCount:1}]` — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified-email owner → `EMAIL_UNVERIFIED`; sessioned non-owner / other salon → `FORBIDDEN` — verify: Behat
- [ ] Helper: `ownerStatsPath` mirrors `ownerChatPath` (`/owner/stats`, `?salon=` only when not first owned) — verify: Vitest
- [ ] Helper: `statsHourLabel(0\|9\|14)` → `00:00` / `09:00` / `14:00` — verify: Vitest
- [ ] i18n: `Statistika` / `Termini ove sedmice` / `Otkazivanja` / `Kasna otkazivanja` / `Zauzetost` / `Najzauzetiji sati` / `Nema termina ove sedmice.` — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Epic 9 same busy math), `04-Frontend.md` (`/owner` stats; lazy owner chunks; salon switcher), `05-Data-Model.md` (busy-level percent; cancel snapshot), `08-Decisions.md` #8 #10 #15 #16 #19 #22, `docs/adr/0016-cancel-fifth-status.md`.

- [ ] GraphQL `salonStats(salonId: ID!): SalonStats!` with `OwnerAccess` (same codes as `pendingBookings`). Types: `SalonStats` (`fromDate`, `toDate`, `bookingsCount`, `cancellationRatePercent`, `lateCancels`, `days: [SalonStatsDay!]!`, `hours: [SalonStatsHour!]!`); `SalonStatsDay` (`date`, `weekday: Weekday!`, `bookingsCount`, `busyPercent`); `SalonStatsHour` (`hour: Int!`, `bookingsCount`). No stats fields on public `Salon`. No `busyPercent` on guest `busyLevel`. No new `Subscription`. No REST. No new tables/columns. `Occupancy` formula and thresholds unchanged — verify: schema; `Occupancy.php` unchanged math; no new migration
- [ ] `/owner/stats` lazy owner route (clone chats chrome: AuthShell, email gate, `notOwner`, `?salon=` switcher, `OwnerNav` + chat badge, `useOwnerPush`). Customer routes (`/`, `/salon/:id`, `/bookings`) do not link or mount stats. Home stays `/owner` queue+panel — verify: `App.tsx` + owner/customer pages
- [ ] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- QR scan / conversion stats (STORY-37)
- Trust badge display (Phase 2)
- Revenue tracking
- Customer-facing stats
- Changing `Occupancy` or busy-level thresholds
- Week picker / date-range caption
- Chart library
- Owner settings
- No-show counters UI (STORY-35)
- Stats subscription / `pollInterval`
- Playwright, Pest, GraphQL codegen, `vite-plugin-pwa`
- New Compose services

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-36.md`, `docs/glossary.md` (**Busy-level**, **Late cancel**), `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; numbers + lists, no chart lib. Bosnian-first.
2. Branch: `cursor/story-36-basic-stats-ff6a` (already).
3. **Query:** `salonStats(salonId)` via `OwnerAccess::salon(OwnerAccess::user($context), $salonId)`. Window: Sarajevo `today` = `CarbonImmutable::now('Europe/Sarajevo')->toDateString()`; `fromDate` = today−6 days; `toDate` = today; inclusive. Count axis = `preferred_date` + status `confirmed`|`cancelled`. Rate = `intdiv(cancelled * 100, confirmed + cancelled)` or 0. `lateCancels` = `late_cancel` true on those cancelled rows. Days: 7 dates, `Occupancy::percent` per date, `bookingsCount` confirmed+cancelled that date. Hours: hour from `preferred_starts_at` in `Europe/Sarajevo` (`H` as int 0–23); skip 0; sort count desc, hour asc. Do not change `Occupancy` or `SalonBusyLevel`. Do not add columns.
4. **PWA:** lazy `OwnerStats` at `/owner/stats`. Clone `OwnerChats` shell (login, verify, notOwner, switcher, nav, badge, `useOwnerPush`). `OwnerNav` `active: 'queue' | 'chats' | 'stats'`. Summary: `bookingsCount`, `cancellationRatePercent` + `%`, `lateCancels`. Then 7 day rows (`weekday.*`, count, `Zauzetost` `n%`). Then hours (`statsHourLabel` + count). If `bookingsCount===0`, also show `owner.statsEmpty`. No date-range caption. No `/owner/stats` link on customer pages.
5. **i18n:** `owner.stats` `Statistika`; `owner.statsBookings` `Termini ove sedmice`; `owner.statsRate` `Otkazivanja`; `owner.statsLate` `Kasna otkazivanja`; `owner.statsBusy` `Zauzetost`; `owner.statsHours` `Najzauzetiji sati`; `owner.statsEmpty` `Nema termina ove sedmice.`
6. **Behat:** `features/owner/salon_stats.feature`, English Gherkin, GraphQL-over-HTTP. Cover every Behat product check (window, empty, status/date/salon filters, rate + late, occupancy vs count split, hour sort, auth). Keep existing occupancy/cancel features green. Do not change `behat.yml`.
7. **Vitest:** `ownerStatsPath`, `statsHourLabel`, the seven i18n strings. Keep existing owner tests green.
8. Patch `docs/architecture/04-Frontend.md` so `/owner/stats` is named (lazy stats screen, `?salon=`, OwnerNav, not home). Do not rewrite Epic 9 busy math.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
