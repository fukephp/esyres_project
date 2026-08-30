# Backend

Laravel is the only application server. Lighthouse exposes one `/graphql` endpoint. PHP types, mutations, and policies are the source of truth (code-first). Frontend codegen introspects the **local** schema. Introspection is off in staging/production; query depth and complexity limits are on.

## Domain mapped to epics

- Epic 1 — public `salonsNearby`, `popularInSarajevo`, salon profile, server-computed `busyLevel`
- Epic 2 — register/login, email verify (signed GET + `resendVerificationEmail`), phone OTP, `createBooking` (preferred date + time)
- Epic 3 — owner inbox, availability grid, `acceptPreferredTime`, `proposeTime` (counter-propose), `declineBooking`
- Epic 4 — customer respond to counter-proposal; “ask other day or time” updates the **same** booking row
- Epic 5 — reschedule (original slot stays occupied until new time approved), cancel
- Epic 6 — queued notifications
- Epic 7 — salon/services/workers/hours (invite provisions salon + owner)
- Epic 8 — QR reconcile, trust timestamps/counters
- Epic 9 — aggregates for owner stats (same busy math as customer badge)

## Conventions

- MySQL is the source of truth. Redis holds OTP TTL, cache, queues, Reverb — not bookings.
- GraphQL `ID` is the MySQL bigint.
- Money is integer **feninga**.
- Dates: `preferred_date` is a Sarajevo calendar date; `preferred_starts_at` is derived from `preferred_date` + local preferred time, stored UTC. `APP_TIMEZONE=Europe/Sarajevo`.
- Lists: limit/offset with a capped `perPage`.
- Photos: Laravel Storage (local `public` disk). Upload via GraphQL multipart. Swap disk to S3-compatible later. No Spatie.
- Busy-level is computed on the server (`LOW | MEDIUM | HIGH` + percent). Thresholds remain product placeholders.
- Overlap: `time_proposed` and `confirmed` occupy `[startsAt, startsAt + duration)` on a worker. `requested` does not occupy a clock slot. `acceptPreferredTime` sets `confirmed` directly when the owner accepts the guest's preferred time.
- Expire job: placeholder TTLs in config; status becomes `declined` with reason `expired` (no fifth status).

## Backend testing (Behat)

Behat is the only backend verify gate for MVP. Do not add Pest or a parallel PHPUnit suite.

- **Driver:** GraphQL-over-HTTP against `/graphql` (booking lifecycle + schema). No Mink/browser Behat — Playwright owns UI flows.
- **Suites:** `owner` (`features/owner/`) and `guest` (`features/guest/`). One context class per suite; shared Laravel boot, fixtures, and HTTP live in traits. Inner loop: `vendor/bin/behat --suite owner` (or `guest`).
- **Verify command:** `docker compose run --rm php vendor/bin/behat` from `esyres_app/` (runs both suites). Do not document `php artisan test` or `composer test` as the backend gate.
- **Auth:** Sanctum cookie/session steps (CSRF like the SPA). No Bearer tokens and no test-only auth bypass. Behat uses `APP_ENV=testing`, bcrypt 4, and the array session driver (in-process cookies, same CSRF flow).
- **Database:** Dedicated MySQL test DB on Compose (`mysql` service). Migrate once per process, then per-scenario truncate + Gherkin fixtures — not a shared seeded DB and not sqlite for Behat.
- **Side effects:** Behat env uses the sync queue plus fake/log SMS, mail, and push. Do not require a live worker in the default gate.
- **OTP:** Fake `SmsGateway` stores the last code; Behat reads it and calls the same verify mutation as the app. Fixtures may set `phone_verified_at` when OTP is not under test. No magic OTP in app code.
- **Gherkin:** English feature files and step defs.

Behat is installed. GraphQL feature files land with Lighthouse — not before.

## Queues

SMS, email, and web push are **never** sent inline on a mutation. A worker container runs the same PHP image.

## What not to add

Scout/Meilisearch, Octane, Horizon container, Telescope in staging, worker auth, payments.
