# Answer key: E3-tap-fallback

> Epic 3: Request Detail tap/form fallback to drag (`proposeTime` same-day).
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E3-tap-fallback.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-tap-fallback |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want a tap-based fallback to the drag interaction, so that I can still manage requests from my phone.” |
| Goal (one sentence) | A verified owner opens Request Detail from Predloži and counter-proposes via a form that calls the same same-day `proposeTime` as drag; accept and decline reuse existing mutations. |
| Branch name | `story/E3-tap-fallback` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-01 |

## Pass/fail — product

- [ ] Verified owner `ownerBooking(id)` on a booking at their salon returns that `Booking` (requested, confirmed, time_proposed, or declined) with `id` / `status` / `customerName` / `preferredDate` / `preferredStartsAt` / `durationMinutes` / `worker` / `services`; missing id or other salon’s owner → `FORBIDDEN`; guest → `UNAUTHENTICATED`; unverified owner → `EMAIL_UNVERIFIED` — verify: Behat
- [ ] Helpers: `proposeStartTimes(cells, blocks, workerId)` = 15-min starts where `canDropOnStart` (free, not off, not occupied on that worker); empty cells → `[]`. `ownerQueuePath(date, today)` → `/owner` when date is today else `/owner?date=YYYY-MM-DD` — verify: Vitest
- [ ] `/owner` every pending row has Predloži → `/owner/requests/:id`; `/owner/requests/:id` shows preferred date + time, worker + time selects, Predloži submit, Prihvati if named worker, Odbi two-step, Nazad; not requested → bounce copy + Nazad only — verify: human-only: PR screenshots desktop+mobile (queue Predloži + Request Detail form)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` (#10, #29), `docs/adr/0008-drag-always-proposetime.md`.

- [ ] Lighthouse `/graphql` only; `ownerBooking(id: ID!): Booking!`; no new mutations; `proposeTime` / `acceptPreferredTime` / `declineBooking` signatures unchanged — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; owner query requires `email_verified_at` + owns the salon, not phone OTP — verify: Behat login steps; no `actingAs` / magic token
- [ ] `/owner/requests/:id` lazy in the same owner chunk as `/owner` (not in the customer bundle); Predloži is a `Link`; queue Prihvati / Odbi / drag unchanged; no Reverb/subscription; no status notification job — verify: `esyres_app/frontend` routes + lazy import; no new Jobs for notify
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; owner Behat feature exists
- [ ] No GraphQL codegen, `vite-plugin-pwa`, Playwright this PR — verify: `esyres_app/frontend/package.json`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Cross-day propose / date argument on `proposeTime`
- Accept-with-worker for no-preference (`WORKER_REQUIRED` stays)
- Keyboard-dnd / `@dnd-kit` KeyboardSensor
- Mini availability grid on Request Detail
- Native `type=time` input
- Assistant origin tag + collapsed transcript (Epic 10)
- Stripping Prihvati / Odbi off the queue
- Customer Time Proposed / My Bookings (Epic 4)
- Status notifications (push / SMS / email) — Epic 6
- In-flight chat tab, Take over (Epic 10)
- Salon switcher chrome (Epic 7)
- Changing `acceptPreferredTime` / `proposeTime` hours or overlap behavior
- Request auto-expire job / TTL
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Trust badge **display** (Phase 2)
- Public owner registration; worker logins; payments

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0008-drag-always-proposetime.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E3-tap-fallback` from a HEAD that already has `/owner` queue + panel + `acceptPreferredTime` + `proposeTime` + `declineBooking`.
3. **GraphQL:** `ownerBooking(id: ID!): Booking!`. `OwnerAccess::user` then load booking; missing or `salon.owner_id !== user` → `FORBIDDEN`. Do **not** filter by status — return confirmed / time_proposed / declined so the UI can bounce. Guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`. With `customer`, `worker`, `services`, `salon`. Not nested on public `salon`. Do not add mutations. Do not change `proposeTime` args (still `HH:mm` on `preferred_date`).
4. **Behat:** owner suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Cover every product GraphQL check above (requested + one non-requested status, auth errors, other owner). Existing guest + owner features must still pass. No Mink.
5. **PWA route:** lazy `OwnerRequestDetail` (or equivalent) at `/owner/requests/:id` in the **same** owner chunk pattern as `OwnerHome` (customer first paint must not ship the panel/`@dnd-kit`). Auth chrome matches `/owner` (login `allowRegister={false}`, email verify, not-owner). Query `ownerBooking`, `salon(id) { workers hours }`, `occupyingBookings(salonId, preferredDate)`.
6. **Queue:** Predloži on every pending row (`Link` to `/owner/requests/:id`). Copy: `owner.propose` = “Predloži”. `onPointerDown` stopPropagation so drag does not steal the click. Prihvati / Odbi / drag unchanged.
7. **Request Detail (requested):** show customer, services, duration, preferred date (read-only) and preferred time (context). Worker `<select>` required: salon workers; prefill `worker.id` when named; no-preference empty option “Odaberi radnika” (`owner.pickWorker`). Time `<select>`: `proposeStartTimes` for the selected worker (empty until a worker is chosen). Not `type=time`. Not a cell grid. Zero workers → existing “Nema radnika.” Closed day / no droppable times → existing “Zatvoreno ovaj dan.” Submit disabled until worker + time. Submit Predloži → `proposeTime(bookingId, workerId, HH:mm)`. Prihvati if `canAcceptPreferredTime`. Odbi two-step same as the queue (optional reason, Potvrdi / Odustani). Reuse accept/propose/decline error keys. Disable while in flight. No optimistic cache, no toast kit.
8. **After mutate:** on success `navigate(ownerQueuePath(preferredDate))`. On error stay and show copy. If `ownerBooking.status !== REQUESTED` (or query `FORBIDDEN`): bounce “Zahtjev više nije na čekanju.” (`owner.acceptError.NOT_REQUESTED`) + Nazad (`owner.back` = “Nazad”) to `ownerQueuePath`. Nazad always visible for requested too. Failed `ownerBooking` load for guest/unverified uses the same auth chrome as `/owner`, not the bounce line.
9. **Vitest:** `proposeStartTimes` (free vs occupied vs off vs empty/closed) and `ownerQueuePath`. Keep existing tests passing.
10. Patch `docs/architecture/04-Frontend.md` UX constraints: `/owner` queue Predloži opens `/owner/requests/:id` (Request Detail: form `proposeTime`, Prihvati, Odbi). Do not expand Epic 4/5/6/10.
11. Do not add Pest, Redis, codegen, Playwright, Reverb, notify jobs, or a date arg on `proposeTime`.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: PR linking this key; list commands run. Embed **desktop + mobile** screenshots of queue Predloži + Request Detail form in the PR description. Do not commit shot files. If shots cannot be attached, open a draft/blocked PR.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
