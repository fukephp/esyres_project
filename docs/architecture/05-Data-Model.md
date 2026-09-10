# Data model

Sketch only — no migrations. Status machine: `requested → confirmed` (owner accepts preferred time), `requested → declined` (owner decline; see `docs/adr/0010-owner-decline-from-requested.md`), or `requested → time_proposed → confirmed | declined` (owner counter-proposes). A **confirmed** booking may become `cancelled` (customer cancel; see `docs/adr/0016-cancel-fifth-status.md`). Expire still maps to `declined` (no fifth status for expire).

## Time and money

- `APP_TIMEZONE=Europe/Sarajevo`
- `bookings.preferred_date` — calendar date in Sarajevo (client sends `"YYYY-MM-DD"`, not a JS `Date`)
- `bookings.preferred_starts_at` — guest's preferred date+time as UTC instant (derived from `preferred_date` + local time input)
- `proposed_starts_at` / other instants — UTC
- Prices — integer feninga (`Int` in GraphQL), formatted as BAM
- IDs — MySQL bigint, same value as GraphQL `ID`

## Entities

- **User** — email+password; `email_verified_at`; optional `phone` (E.164, any country, unique when present) + `phone_verified_at`; roles: can be customer and owner. Integer trust counters `cancel_count` / `late_cancel_count` / `no_show_count` (default 0; incremented in the event transaction, see `docs/adr/0020-trust-counters-increment-on-event.md`). See `docs/adr/0006-phone-e164-any-country.md`.
- **Salon** — `owner_id`, profile, address, `lat`/`lng`, hours, breaks, holidays, `cancellation_notice_hours`, `reschedule_cap` (default 1), `dnd` (default false; turns take-over off), photos on disk. Same three trust counters as User (per salon). One user may own many salons (separate profiles, not a chain-location product).
- **Worker** — belongs to a salon; assigned to services; active/inactive. Inherits salon hours. Not a user.
- **Service** — belongs to salon; `duration_minutes` (default 30), price feninga, category (hair / make-up / massage).
- **Booking** — `salon_id`, `customer_id`, optional `worker_id` (null = no preference until accept/propose), `preferred_date`, `preferred_starts_at`, status, `proposed_starts_at`, `proposed_worker_id`, duration derived from services (sum, rounded up to 15 minutes), decline/expire reason. Optional overlay `reschedule_date` / `reschedule_starts_at` on a **confirmed** row (in-progress reschedule; does not occupy). Customer cancel of confirmed sets `cancelled` and snapshots `cancelled_at` plus late (inside `cancellation_notice_hours` at cancel time). `owner_responded_at` is set once on the first successful accept, counter-propose, or decline (see `docs/adr/0007-owner-responded-at-on-first-action.md`). Optional `no_show_at` (nullable; owner mark after start; status stays `confirmed`; still occupies; see `docs/adr/0019-owner-marks-no-show-after-start.md`). Optional `reminder_day_sent_at` / `reminder_hour_sent_at` (nullable; set when that reminder mail is sent; cleared on accept-reschedule). Optional `CreateBookingInput.intakeToken` may attach an in-flight `AssistantIntake` (does not change the status machine). Converted intake is the origin signal (no `bookings.origin`); owner GraphQL may nest it on `Booking` when the session owns the salon.
- **AssistantIntake** — salon-scoped scripted-chat snapshot that is not a request yet (`token` UUID for the guest, bigint PK internally). In-flight while `booking_id` is null and `updated_at` is within 24h. Optional `taken_over_at` pauses guest upsert/chat-send while the salon is open and DND is off (`takenOver` is that pause **in effect**, not the raw flag). Optional `pinged_at` marks a guest ping (`pinged` is true when that timestamp is set; not gated by hours or DND). Converted when chat `createBooking` attaches `booking_id`. Not a message log; Request Detail transcript is the labeled snapshot (services, worker, day, time).
- **BookingService** — services on a booking; durations/prices snapshot at request time.
- **QrScan** — scan events; guest hold is a cookie until reconcile.
- **PushSubscription** — VAPID endpoint + keys per user.
- Trust: `owner_responded_at` on the booking; `no_show_at` on the booking; cancel/late/no-show integer counters on user and salon; `email_verified_at` / `phone_verified_at` stay the verification record. QR visited stays STORY-34. Badge **display** is still Phase 2.

## Slot occupancy

- Grid cells: 15 minutes. Block length = sum of service durations, rounded up to 15.
- No buffer time.
- Workers inherit salon open/break/holiday holes.
- Occupied: `time_proposed` and `confirmed` on that worker’s range. `requested` counts toward **day** busy-level only. `cancelled` does not occupy and does not count toward busy-level. An in-progress reschedule overlay does **not** occupy; busy-level stays on the original `preferred_date`.
- Reschedule: same confirmed row; original stays occupied until the owner accepts the overlay (see `docs/adr/0015-reschedule-same-row-overlay.md`). Dismiss clears the overlay. Default cap 1 in-progress overlay per booking (`reschedule_cap`; `0` disables).
- “Ask for a different day or time”: **same row** → `requested`, new `preferred_date` and/or `preferred_starts_at`, clear proposal fields, keep events.

## Busy-level

Server computes per salon-day: enum + percent. Customer UI only renders the enum. Thresholds remain placeholders (see `docs/mvp/08`).

## Auto-expire

Scheduled command. TTL numbers are config placeholders. Result: `declined` + reason `expired`.
