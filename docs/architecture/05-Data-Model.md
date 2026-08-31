# Data model

Sketch only — no migrations. Status machine: `requested → confirmed` (owner accepts preferred time) or `requested → time_proposed → confirmed | declined` (owner counter-proposes).

## Time and money

- `APP_TIMEZONE=Europe/Sarajevo`
- `bookings.preferred_date` — calendar date in Sarajevo (client sends `"YYYY-MM-DD"`, not a JS `Date`)
- `bookings.preferred_starts_at` — guest's preferred date+time as UTC instant (derived from `preferred_date` + local time input)
- `proposed_starts_at` / other instants — UTC
- Prices — integer feninga (`Int` in GraphQL), formatted as BAM
- IDs — MySQL bigint, same value as GraphQL `ID`

## Entities

- **User** — email+password; `email_verified_at`; optional `phone` (E.164, any country, unique when present) + `phone_verified_at`; roles: can be customer and owner. See `docs/adr/0006-phone-e164-any-country.md`.
- **Salon** — `owner_id`, profile, address, `lat`/`lng`, hours, breaks, holidays, `cancellation_notice_hours`, reschedule cap, photos on disk. One user may own many salons (separate profiles, not a chain-location product).
- **Worker** — belongs to a salon; assigned to services; active/inactive. Inherits salon hours. Not a user.
- **Service** — belongs to salon; `duration_minutes` (default 30), price feninga, category (hair / make-up / massage).
- **Booking** — `salon_id`, `customer_id`, optional `worker_id` (null = no preference until accept/propose), `preferred_date`, `preferred_starts_at`, status, `proposed_starts_at`, `proposed_worker_id`, duration derived from services (sum, rounded up to 15 minutes), decline/expire reason. `owner_responded_at` is set once on the first successful accept or counter-propose (see `docs/adr/0007-owner-responded-at-on-first-action.md`).
- **BookingService** — services on a booking; durations/prices snapshot at request time.
- **QrScan** — scan events; guest hold is a cookie until reconcile.
- **PushSubscription** — VAPID endpoint + keys per user.
- Trust counters / timestamps on user, salon, and booking as needed (response time, no-show, cancel, visited). Badge **display** is still Phase 2.

## Slot occupancy

- Grid cells: 15 minutes. Block length = sum of service durations, rounded up to 15.
- No buffer time.
- Workers inherit salon open/break/holiday holes.
- Occupied: `time_proposed` and `confirmed` on that worker’s range. `requested` counts toward **day** busy-level only.
- Reschedule: confirmed original stays occupied until the new proposal is approved.
- “Ask for a different day or time”: **same row** → `requested`, new `preferred_date` and/or `preferred_starts_at`, clear proposal fields, keep events.

## Busy-level

Server computes per salon-day: enum + percent. Customer UI only renders the enum. Thresholds remain placeholders (see `docs/mvp/08`).

## Auto-expire

Scheduled command. TTL numbers are config placeholders. Result: `declined` + reason `expired`.
