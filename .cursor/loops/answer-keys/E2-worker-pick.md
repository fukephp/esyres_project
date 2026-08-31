# Answer key: E2-worker-pick

> Epic 2: optional worker or no preference on the salon picker. Mutation already takes `workerId`; this PR ungates guest `salon.workers` and adds the radios.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E2-worker-pick.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-worker-pick |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to optionally pick a specific worker or say "no preference," so that I have control when I care, and less friction when I don't.” |
| Goal (one sentence) | A guest on `/salon/:id` can read workers and, in picking mode, send `createBooking` with a named `workerId` or omit it for **no preference**. |
| Branch name | `story/E2-worker-pick` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-31 |

## Pass/fail — product

- [ ] Guest can query `salon.workers` (`id`, `name`) without a session; empty salon → `[]`; after a fixture worker, the name is returned — verify: Behat
- [ ] Guest querying `cancellationNoticeHours` still gets `UNAUTHENTICATED`; owner can still query workers + notice hours — verify: Behat
- [ ] Verified customer `createBooking` with that salon’s `workerId` stores `bookings.worker_id`; omitted `workerId` still stores null; foreign worker still `INVALID_WORKER` — verify: Behat
- [ ] Helper: no-preference selection omits `workerId`; a named id is passed through — verify: Vitest
- [ ] Picking-mode radios (Nema preference default, then names; hidden when zero workers) look right on desktop and mobile — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md`.

- [ ] Lighthouse `/graphql` only; no new booking mutation; `workerId` stays optional on existing `CreateBookingInput` — verify: schema; Behat hits `/graphql`
- [ ] `salon.workers` is public (`id` + `name` only); `cancellationNoticeHours` and worker create/update stay owner-gated; no second workers field — verify: Behat + schema
- [ ] Null `worker_id` remains **no preference**; no fake “any” worker row; no `active` column or worker↔service table this PR — verify: migration unchanged except if none needed; Behat
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; Behat covers the GraphQL checks
- [ ] No Redis, codegen, `vite-plugin-pwa`, Playwright, `/owner` worker UI, or chat this PR — verify: `esyres_app/docker-compose.yml`; frontend routes

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). MySQL must be up. Every command must exit 0.

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Chat worker step (Epic 10)
- Owner panel / queue visual treatment for no-preference vs named (Epic 3)
- Worker↔service assignment, active/inactive, photos, per-worker hours
- Worker logins
- Changing `createBooking` send gates or OTP/email-verify
- Adding `worker` on the GraphQL `Booking` type
- Designed week-busy strip / picker polish (sibling E2-day-time-picker)
- Dedicated confirmation screen (sibling E2-request-sent)
- My Bookings list (Epic 4)
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- nginx, redis, reverb, mailpit
- Native apps, payments, public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E2-worker-pick`.
3. **GraphQL:** resolve `Salon.workers` without `OwnerAccess` (same public pattern as `services`). Keep `cancellationNoticeHours` on `SalonOwnerField`. Type stays `id` + `name`. No new mutation. `CreateBookingInput.workerId` stays optional. Do not add `worker` to `Booking`.
4. **Behat:** guest suite: public workers empty / named; guest `cancellationNoticeHours` still `UNAUTHENTICATED`; owner workers query still passes. Add `createBooking` with this salon’s worker and assert `bookings.worker_id`. Keep omit-null and foreign `INVALID_WORKER`. Existing features must still pass. English Gherkin, GraphQL-over-HTTP, no Mink.
5. **PWA:** `PUBLIC_SALON_QUERY` includes `workers { id name }`. After `Pošalji zahtjev`, if workers.length > 0, radio group: first **Nema preference** (default), then names. Zero workers: hide the group. Default omits `workerId` on `createBooking` (login / email / OTP retry must pass the same optional id). No catalog worker list, no chips, no select, no avatars. i18n `bs` for the label and Nema preference. Stay on `/salon/:id`.
6. **Vitest:** helper used by the picker: no-preference → omit `workerId`; named id → that string. Keep existing booking/discovery tests passing.
7. Patch `docs/architecture/04-Frontend.md` UX constraints with one line: picker optional worker radios (no preference default); not a slot grid. Do not expand MVP UI-goals “not yet decided” owner treatment.
8. Do not add Pest, Redis, codegen, Playwright, `/owner`, or chat.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of picking-mode radios (Nema preference + a named worker) in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
