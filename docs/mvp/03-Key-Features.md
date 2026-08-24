# Key Features

*This file separates what's locked for MVP from what's explicitly deferred to Phase 2, per current decisions.*

## Customer-Facing (MVP)

- **Discovery/Home** — no login required; geolocation-based "salons near you," falling back to "Popular in Sarajevo"; search/filter by service type and name.
- **Salon Profile** — photos, address, working hours, service list with prices/durations, and a busy-level badge (🟢/🟡/🔴 — see below). Optional link-out to maps; no in-app map SDK.
- **Busy-Level Indicator** — coarse signal of how booked a day is, shown instead of a detailed time grid. Deliberately hides per-slot scheduling detail from customers.
- **Service Selection** — multi-select, durations/prices stack automatically.
- **Worker & Day Selection** — pick a specific worker or "no preference"; pick a preferred day only, never an exact time.
- **Registration / login** — email + password. Guest browse has no login wall. Email verification is required before a request can be sent (and before owner routes). Phone is optional at register (encouraged); **phone OTP is required to send a request**. Verified phone also enables OTP as an alternate login. `phone_verified_at` is captured now; reward-badge **display** is Phase 2.
- **Send Request** — creates a `requested` booking; no clock slot is held yet, just counted toward that day's busy-level.
- **Time Proposed screen** — Approve / Reject / Ask for a different day. Ask-other-day **reopens the same booking** (`requested` + new preferred day); it does not spawn a second request.
- **My Bookings** — list of requests by status (Pending / Time Proposed / Confirmed / Declined); cancel/reschedule confirmed bookings.
- **Reschedule** — original confirmed booking stays untouched and protected until a new proposed time is approved.
- **Cancel** — owner-configurable notice window; late cancellations get a warning, not a hard block.
- **Favorites** — save salons, including auto-bookmarking via the QR Reconnect Loop (see below).
- **Notifications** — web push + SMS fallback for status changes (time proposed / confirmed / declined); email for reminders (day-before/hour-before).

## Owner-Facing (MVP)

- **Reservation Inbox / Pending Requests Queue** — sorted by upcoming/requested day, soonest first; near-expiry visual urgency cues; reschedule requests visually tagged.
- **Worker Availability Panel** — table of workers × **15-minute** slots per day. Pending requests sit in a queue at the top of each day; the owner **drags** a request onto an open slot to propose a time (sets `time_proposed`, not `confirmed`). A proposal **holds that slot** until confirm, decline, or expire. `requested` does not occupy a clock slot.
- **Request Detail (fallback to drag)** — tap a pending item to accept/decline/propose a time via a form; needed for touch devices where drag is unreliable.
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
- Viber and/or WhatsApp messaging (owner re-engagement / marketing outreach) — architecture and cost notes researched, channel choice not decided.
- Native app (App Store presence).
- Customer referral incentive mechanic.
- Reviews/ratings system.
- Worker self-service login.
- Buffer time between bookings, per-worker off/vacation days / hourly shifts.
- Chain multi-location (shared workers/services across sites), receptionist/manager roles, waitlists, gift cards, group bookings, package deals.
