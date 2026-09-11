# Backend

Laravel is the only application server. Lighthouse exposes one `/graphql` endpoint. PHP types, mutations, and policies are the source of truth (code-first). Frontend codegen introspects the **local** schema. Introspection is off in staging/production; query depth and complexity limits are on.

## Domain mapped to epics

- Epic 1 — public `salonsNearby`, `popularInSarajevo`, salon profile, server-computed `busyLevel`
- Epic 2 — register/login, email verify (signed GET + `resendVerificationEmail`), phone OTP, `createBooking` (preferred date + time)
- Epic 3 — owner inbox, availability grid, `acceptPreferredTime`, `proposeTime` (counter-propose), `declineBooking`
- Epic 4 — customer respond to counter-proposal; “ask other day or time” updates the **same** booking row
- Epic 5 — reschedule (original slot stays occupied until new time approved), cancel
- Epic 6 — queued notifications
- Epic 7 — salon/services/workers/hours (`createSalon` + owner catalog)
- Epic 8 — QR reconcile, trust timestamps/counters
- Epic 9 — aggregates for owner stats (same busy math as customer badge)

## Conventions

- MySQL is the source of truth. Laravel Cache holds OTP TTL (Redis when that service is in compose). Redis remains the target for cache, queues, Reverb — not bookings. See `docs/adr/0005-otp-in-laravel-cache.md`.
- GraphQL `ID` is the MySQL bigint.
- Money is integer **feninga**.
- Dates: `preferred_date` is a Sarajevo calendar date; `preferred_starts_at` is derived from `preferred_date` + local preferred time, stored UTC. `APP_TIMEZONE=Europe/Sarajevo`.
- Lists: limit/offset with a capped `perPage`.
- Photos: Laravel Storage (local `public` disk). Upload via GraphQL multipart. Swap disk to S3-compatible later. No Spatie.
- Busy-level is computed on the server (`LOW | MEDIUM | HIGH` + percent). Thresholds remain product placeholders.
- Overlap: `time_proposed` and `confirmed` occupy `[startsAt, startsAt + duration)` on a worker. `requested` does not occupy a clock slot. `cancelled` does not occupy. `acceptPreferredTime` sets `confirmed` directly when the owner accepts the guest's preferred time.
- Expire job: placeholder TTLs in config; status becomes `declined` with reason `expired` (no fifth status for expire). Customer cancel of a confirmed booking is `cancelled` (see `docs/adr/0016-cancel-fifth-status.md`).
- Reminder scan: scheduled `bookings:send-reminders` (not delayed jobs on confirm). Stamps `reminder_day_sent_at` / `reminder_hour_sent_at`. See `docs/adr/0018-reminder-scan-not-delayed-jobs.md`.

## Backend testing (Behat)

Behat is the only backend verify gate for MVP. Do not add Pest or a parallel PHPUnit suite.

- **Driver:** GraphQL-over-HTTP against `/graphql` (booking lifecycle + schema). No Mink/browser Behat — Playwright owns UI flows.
- **Suites:** `owner` (`features/owner/`) and `guest` (`features/guest/`). One context class per suite; shared Laravel boot, fixtures, and HTTP live in traits. Inner loop: `vendor/bin/behat --format=progress --stop-on-failure --suite owner` (or `guest`).
- **Verify command:** `docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure` from `esyres_app/` after `docker compose up -d` (runs both suites). Flags are CLI-only; do not put them in `behat.yml`. A green run still means the full selected suite passed. Do not document `php artisan test` or `composer test` as the backend gate.
- **Auth:** Sanctum cookie/session steps (CSRF like the SPA). No Bearer tokens and no test-only auth bypass. Behat uses `APP_ENV=testing`, bcrypt 4, and the array session driver (in-process cookies, same CSRF flow).
- **Database:** Dedicated MySQL test DB `esyres_test` on Compose (`mysql` service). Env is committed `.env.behat`, custom-loaded with overwrite before bootstrap (Laravel’s `.env` / `.env.testing` will not override Compose `DB_DATABASE=esyres`). Assert the live connection name is `esyres_test` before `migrate:fresh`. Never truncate or migrate the seeded app DB `esyres`. Migrate once per process, then per-scenario truncate + Gherkin fixtures — not a shared seeded DB and not sqlite for Behat.
- **Side effects:** Behat env uses the sync queue plus fake/log SMS, mail, and push. Do not require a live worker in the default gate.
- **OTP:** Fake `SmsGateway` stores the last code; Behat reads it and calls the same verify mutation as the app. Fixtures may set `phone_verified_at` when OTP is not under test. No magic OTP in app code.
- **Gherkin:** English feature files and step defs.

Behat is installed. GraphQL feature files land with Lighthouse — not before.

## Queues

SMS, email, and web push are **never** sent inline on a mutation. A worker container runs the same PHP image.

## What not to add

Scout/Meilisearch, Octane, Horizon container, Telescope in staging, worker auth, payments.
