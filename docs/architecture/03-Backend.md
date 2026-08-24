# Backend

Laravel is the only application server. Lighthouse exposes one `/graphql` endpoint. PHP types, mutations, and policies are the source of truth (code-first). Frontend codegen introspects the **local** schema. Introspection is off in staging/production; query depth and complexity limits are on.

## Domain mapped to epics

- Epic 1 — public `salonsNearby`, `popularInSarajevo`, salon profile, server-computed `busyLevel`
- Epic 2 — register/login, email verify, phone OTP, `createBooking` (day only)
- Epic 3 — owner inbox, availability grid, `proposeTime`, `declineBooking`
- Epic 4 — customer respond; “ask other day” updates the **same** booking row
- Epic 5 — reschedule (original slot stays occupied until new time approved), cancel
- Epic 6 — queued notifications
- Epic 7 — salon/services/workers/hours (invite provisions salon + owner)
- Epic 8 — QR reconcile, trust timestamps/counters
- Epic 9 — aggregates for owner stats (same busy math as customer badge)

## Conventions

- MySQL is the source of truth. Redis holds OTP TTL, cache, queues, Reverb — not bookings.
- GraphQL `ID` is the MySQL bigint.
- Money is integer **feninga**. Dates: `preferred_date` is a Sarajevo calendar date. Clock times stored UTC. `APP_TIMEZONE=Europe/Sarajevo`.
- Lists: limit/offset with a capped `perPage`.
- Photos: Laravel Storage (local `public` disk). Upload via GraphQL multipart. Swap disk to S3-compatible later. No Spatie.
- Busy-level is computed on the server (`LOW | MEDIUM | HIGH` + percent). Thresholds remain product placeholders.
- Overlap: `time_proposed` and `confirmed` occupy `[startsAt, startsAt + duration)` on a worker. `requested` does not occupy a clock slot.
- Expire job: placeholder TTLs in config; status becomes `declined` with reason `expired` (no fifth status).
- Behat covers booking lifecycle and GraphQL. Do not add Pest as the named suite.

## Queues

SMS, email, and web push are **never** sent inline on a mutation. A worker container runs the same PHP image.

## What not to add

Scout/Meilisearch, Octane, Horizon container, Telescope in staging, worker auth, payments.
