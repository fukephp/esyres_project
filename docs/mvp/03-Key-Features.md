# Key Features

*This file separates what's locked for MVP from what's explicitly deferred to Phase 2, per current decisions.*

## Customer-Facing (MVP)

- **Discovery/Home** — no login required; geolocation-based "salons near you," falling back to "Popular in Sarajevo"; search/filter by service type and name.
- **Salon Profile** — photos, address, working hours, service list with prices/durations, and a busy-level badge (🟢/🟡/🔴 — see below). Optional link-out to maps; no in-app map SDK.
- **Busy-Level Indicator** — coarse signal of how booked a day is, shown instead of a detailed time grid. Deliberately hides per-slot scheduling detail from customers.
- **Service Selection** — multi-select, durations/prices stack automatically.
- **Worker & Date/Time Selection** — pick a specific worker or "no preference"; pick a preferred day and time via a simple picker (no availability grid). This is the **primary** booking CTA on the salon profile (`Pošalji zahtjev`).
- **Salon Booking Assistant (scripted chat)** — alternate path on the same salon profile for messy intent (`Nisi sigurna? Pitaj salon.`). Guided steps: service → worker → day (busy-level) → 1–3 suggested preferred times → confirm. Speaks as the salon, Bosnian, live salon data only (services, KM prices, durations, hours, address, busy-level, workers). Unknown → says it does not know; may ping the owner; guest does not wait. Same `createBooking` as the picker. Chat cannot skip send gates. Already-verified users confirm in one step. Ships after the picker/panel loop exists (Epic 10), still MVP.
- **Registration / login** — email + password. Guest browse has no login wall. Email verification is required before a request can be sent (and before owner routes). Phone is optional at register (encouraged); **phone OTP is required to send a request and to respond to a counter-proposal**. Verified phone also enables OTP as an alternate login. `phone_verified_at` is captured now; reward-badge **display** is Phase 2.
- **Send Request** — creates a `requested` booking with preferred date and time; no clock slot is held yet, just counted toward that day's busy-level. Picker and assistant both produce this row.
- **Time Proposed screen** — Approve / Reject / Ask for a different day or time (shown only when owner counter-proposes). Ask-other-day-or-time **reopens the same booking** (`requested` + new preferred date/time); it does not spawn a second request.
- **My Bookings** — list of requests by status (Pending / Time Proposed / Confirmed / Declined); cancel/reschedule confirmed bookings.
- **Reschedule** — original confirmed booking stays untouched and protected until a new proposed time is approved.
- **Cancel** — owner-configurable notice window; late cancellations get a warning, not a hard block.
- **Favorites** — save salons, including auto-bookmarking via the QR Reconnect Loop (see below).
- **Notifications** — web push + SMS fallback for status changes (time proposed / confirmed / declined); email for reminders (day-before/hour-before).

## Owner-Facing (MVP)

- **Reservation Inbox / Pending Requests Queue** — sorted by upcoming/requested day, soonest first; shows each guest's preferred date and time; near-expiry visual urgency cues; reschedule requests visually tagged.
- **Worker Availability Panel** — table of workers × **15-minute** slots per day. Pending requests sit in a queue at the top of each day; the owner **accepts** a preferred time in one tap or **drags** a request onto an open slot to counter-propose (sets `time_proposed`, not `confirmed`). A counter-proposal **holds that slot** until confirm, decline, or expire. `requested` does not occupy a clock slot.
- **Request Detail (fallback to drag)** — tap a pending item to accept preferred time, decline, or counter-propose via a form; needed for touch devices where drag is unreliable. Assistant-originated requests are tagged; a collapsed transcript is attached (why they asked for Saturday 14:00).
- **In-flight chat tab** — not owner home. Badge for conversations that have not yet become a request. Optional **Take over**: guest waits only after the owner taps it. After hours / DND: take-over off; assistant always finishes to `requested`. No auto-page on every chat. Owner-only; workers are not users.
- **Decline** — optional reason field shown to the customer.
- **Working Hours & Availability Settings** — open days/hours, breaks, holidays, and owner-configurable `cancellation_notice_hours` and reschedule cap (default = 1 in-progress reschedule per booking).
- **Service & Pricing Management** — add/edit services, durations, prices; default service duration 30 min, owner-adjustable.
- **Staff/Worker Management** — assign workers to services; every worker has a row on the panel. Workers inherit salon hours (no per-worker shift editor or vacation calendar at MVP).
- **Salon switcher** — an owner may have more than one salon, each a separate customer-facing profile (hours, workers, QR, busy-level). Not a chain “one brand, many locations” product.
- **Customer History** — booking history, no-show tracking, notes, plus the QR-confirmed "visited" marker.
- **Basic Stats** — bookings per week, busiest hours/days, cancellation rate, day-level busy %, QR scan and scan→verified-visit stats.
- **Notifications** — web push, real-time, for new requests, customer responses, and reschedule requests.

## Shared / Cross-Cutting (MVP)

- **QR Reconnect Loop** — the existing front-counter acquisition QR code gets a second job: a ~7 day guest cookie holds the last scanned salon; once a customer verifies, the scan silently bookmarks the salon as "visited" and adds a reciprocal marker on the owner's customer history. No second sticker, no popups.
- **Trust signal data capture** — response-time timestamps, no-show/cancellation counters, QR scan events, and verification status (`email_verified_at`, `phone_verified_at`) are captured from MVP launch, even though badge display is Phase 2.
- **Owner onboarding** — invite-only / founder-provisioned. No public “Register salon.”
- **Multi-service, multi-category salons** — a salon may offer hair + make-up + massage from day one.

## Explicitly Phase 2 (not MVP)

- Trust badge **display** UI (data capture happens at MVP; display is deferred).
- Viber and/or WhatsApp messaging (owner re-engagement / marketing outreach) and Instagram DM as assistant channels — same booking contract later; not v1. Channel choice not decided.
- LLM / free-form NLU for the assistant (v1 is a scripted flow; an LLM may parse messy text later without changing `createBooking`).
- Native app (App Store presence).
- Customer referral incentive mechanic.
- Reviews/ratings system.
- Worker self-service login.
- Buffer time between bookings, per-worker off/vacation days / hourly shifts.
- Chain multi-location (shared workers/services across sites), receptionist/manager roles, waitlists, gift cards, group bookings, package deals.
