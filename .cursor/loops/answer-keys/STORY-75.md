# Answer key: STORY-75

> Epic 3: OwnerNav Zapisi lists one salon’s bookings by origin and day. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-75 |
| Source | `docs/stories/STORY-75.md` — Zapisi |
| Goal (one sentence) | An owner opens Zapisi for this salon, filters that day’s bookings by origin, and opens any row in Request Detail. |
| Branch name | `story/STORY-75-zapisi` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-29 |

## Pass/fail — product

- [ ] `/owner/zapisi` is a lazy route (Suspense fallback `salon.loading`). Owner shell matches Zahtjevi: `TopNav`, aside, `OwnerNav` `active="zapisi"`, salon switcher when they own more than one salon. Logged-out, unverified email, and not-owner match Zahtjevi’s returns, not the list. h1 is **Zapisi**. The Zapisi link sits in OwnerNav directly under Zahtjevi and before chat, on every owner route. Saloni and Postavke stay without `?salon=` — verify: Vitest `zapisi.source.test.ts`; add `pages/OwnerZapisi.tsx` to the owner-page lists in `topNav.source.test.ts`, `authPlace.source.test.ts`, `ownerSalons.source.test.ts`, and `designPack.test.ts`
- [ ] Day control is a native date field labeled **Datum**, default Sarajevo today. Omit `date` when it is today. A bad `date` uses `ownerDateFromSearch` (today). No month navigator. Chips are **Svi** (default) / **Gost** / **Asistent** / **Telefon**, one selected. Omit `origin` for Svi. Otherwise `origin` is `picker`, `assistant`, or `phone`. An unknown `origin` is Svi. Changing the chip or the day keeps the salon. The switcher keeps the day and the chip. `?salon=` matches Zahtjevi (omit or a bad id → first owned, `id` ASC) — verify: Vitest `owner.test.ts` (`ownerZapisiPath`) and `zapisi.source.test.ts`
- [ ] Sessioned `salonDayBookings(salonId: ID!, date: String!, origin: BookingOrigin): [Booking!]!` for a verified owner of that salon. Guest → `UNAUTHENTICATED`. Unverified email → `EMAIL_UNVERIFIED`. Other salon → `FORBIDDEN`. Bad date → `INVALID_DATE`. Omitted `origin` returns every origin. `PICKER` / `ASSISTANT` / `PHONE` return only that origin. Another salon’s rows stay out. No `limit` or `offset` — verify: Behat `features/owner/zapisi.feature`
- [ ] One row per booking, on the appointment day only. `requested`, `declined`, and `cancelled` match `preferred_date`. `time_proposed` matches the Sarajevo date of `proposed_starts_at` (not `preferred_date` when those differ). `confirmed` matches the Sarajevo date of `preferred_starts_at`, including when `reschedule_date` is set; that overlay day does not also return the row. An assistant intake with no booking is absent — verify: Behat `features/owner/zapisi.feature`
- [ ] Rows sort by that start ascending, then `id` ascending. The start is `proposed_starts_at` when `time_proposed`, otherwise `preferred_starts_at`. Payload `customerName` is the caller name when `origin` is `PHONE`, otherwise the customer’s person name. `origin` is `PICKER`, `ASSISTANT`, or `PHONE`. Service snapshots are on the row — verify: Behat `features/owner/zapisi.feature`
- [ ] Each row shows that start as Sarajevo `HH:mm` (`formatSarajevoTime`), the origin label (**Gost** / **Asistent** / **Telefon**), `customerName`, service snapshot names via `currentJobLabel`, and the status word from `bookings.status` (Na čekanju, Potvrđeno, Predloženo vrijeme, Odbijeno, Otkazano). No worker name. A cancelled Telefon row and a cancelled Gost row both show **Otkazano**. An empty filtered day renders no rows and no empty-state sentence — verify: Vitest `zapisi.source.test.ts` and `owner.test.ts` (`i18n.t` for **Zapisi**, **Svi**, **Gost**, **Datum**)
- [ ] The row links to `/owner/requests/:id?from=zapisi` plus the list’s `date` (omit when today), `salon` (omit when first owned), and `origin` (omit when Svi). **Nazad** on that detail rebuilds `ownerZapisiPath` from those params. A detail opened without `from=zapisi` still uses `ownerQueuePath` — verify: Vitest `zapisi.source.test.ts` and `ownerPanel.source.test.ts`
- [ ] The page refetches `salonDayBookings` on mount. It does not subscribe to `bookingCustomerResponded`, `bookingRescheduled`, or `bookingCancelled` — verify: Vitest `zapisi.source.test.ts`
- [ ] Bosnian `bs` only for the new strings: **Zapisi**, **Svi**, **Gost**, **Datum**. Reuse **Asistent**, **Telefon**, and `bookings.status.*` — verify: Vitest `owner.test.ts`

## Pass/fail — architecture

Cite `docs/mvp/03-Key-Features.md` (Zapisi), `docs/architecture/04-Frontend.md` (owner routes, `?salon=` on Zapisi), `docs/glossary.md` (Booking origin, Phone booking, Caller), `docs/adr/0038-phone-booking-without-customer.md` (phone cancel stays `cancelled`; Zapisi uses the Zahtjevi switcher).

- [ ] One React PWA + one Lighthouse query `App\GraphQL\Queries\SalonDayBookings`. No REST route, no new mutation, no new status, no new column. Do not change phone-booking cancel or customer cancel — verify: diff has that resolver and `salonDayBookings` in `graphql/schema.graphql`; no new migration
- [ ] Record `/owner/zapisi` on the owner routing list in `docs/architecture/04-Frontend.md` and in the owner bullet of `.cursor/CONTEXT.md`. Do not add a month navigator, a chain list, or `?salon=` on the salon catalog — verify: those two docs name `/owner/zapisi`
- [ ] Classifier: this PR touches PHP, `graphql/schema.graphql`, and `features/` → **Behat runs**. Do not change `behat.yml`. Flags stay CLI-only — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP + schema + features).

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

- Telefon wizard (STORY-74)
- Voice recording, a bubble transcript, and an agent that books from audio
- Filters other than origin and day
- In-flight chat rows
- A second Zapisi row on the reschedule day
- Month navigator on Zapisi
- New subscriptions
- Worker column, new cancel action, new statuses, trust-counter changes

## Implementer instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md` for product constraints.
2. Implement **only** what this key requires. Do not expand scope or invent stack.
3. Branch `story/STORY-75-zapisi` from current `master`.
4. Loop: implement → run the CONTEXT frontend-only classifier → run the matching verify commands → fix failures. Count each full implement→verify as one cycle.
5. Stop when all named-verifier product checks, architecture checks, and verify commands pass, **or** when the iteration cap is hit, **or** when the same failure repeats twice with no progress. Human-only checks (at most 1–2) are for the human at PR review unless the key says otherwise.
6. On success: open a PR whose body links this answer key and lists what was verified. UI stories use the same ready rule as non-UI (machine gates). Do not embed screenshots in the PR. Do not open a draft/blocked PR because shots are missing. Do not type credentials into the IDE browser or ask the human to attach shots.
7. On escalate: open a draft/blocked PR with failing checks, last command output summary, and the decision needed from a human. Do not keep spending cycles.
8. Do not mark the PR ready for merge solely because you believe the work is done — machine gates must pass.
9. After PR: trivial Bugbot nits on the same PR (do not burn the cap). If Bugbot contradicts this key, stop and ask.
