# Epics

*High-level groupings of the MVP feature set. Each maps to a chunk of work that could reasonably be built and demoed as a unit. Architecture/data-model breakdown is intentionally excluded — product scope only.*

## Epic 1 — Salon Discovery & Profile Browsing
Guest-accessible discovery flow: location-based "near you" with "Popular in Sarajevo" fallback, search/filter, salon profile page with services, prices, and busy-level badge.

## Epic 2 — Booking Request Flow (Customer)
Service selection (multi-service), worker selection (specific or "no preference"), day-only picker, email+password account, verified email + phone OTP at request submit, pending state.

## Epic 3 — Worker Availability Panel & Time Proposal (Owner)
The core owner scheduling surface: per-day worker × time grid, Pending Requests queue, drag-to-propose interaction (+ tap fallback), Request Detail screen, decline flow.

## Epic 4 — Booking Lifecycle & Customer Response
Time-Proposed screen (Approve / Reject / Ask for a different day on the **same** booking row), status transitions through `requested → time_proposed → confirmed/declined`, My Bookings list.

## Epic 5 — Reschedule & Cancellation
Reschedule flow for confirmed bookings (original stays protected until new time approved), cancellation with owner-configurable notice window, reschedule cap enforcement.

## Epic 6 — Notifications
Web push (owner real-time events, customer time-critical events) + SMS fallback (iOS/undelivered push) for status changes; email channel for day-before/hour-before reminders, including the email verification requirement this introduces.

## Epic 7 — Salon & Service Management (Owner Onboarding)
Salon profile setup (founder invite / provision — no public owner signup), working hours/availability settings (including cancellation notice window), service & pricing management (per-service duration), worker/staff setup, salon switcher if the owner has more than one salon.

## Epic 8 — Trust Signal Data Foundations
QR Reconnect Loop (scan → ~7 day guest cookie → reconcile at verification → Favorites/Customer History markers), response-time tracking, no-show/cancellation counters, email + phone verification status — all captured at MVP even though badge **display** is Phase 2.

## Epic 9 — Basic Stats & Owner Insights
Bookings per week, busiest hours/days, cancellation rate, day-level busy %, QR scan and conversion stats — feeds both the owner's Basic Stats screen and the customer-facing busy-level indicator.

---

## Explicitly Deferred Epics (Phase 2 — not scoped for now)

- Trust Badge Display UI
- Viber/WhatsApp Marketing & Re-engagement Messaging
- Native App
- Referral Incentive Mechanic
- Reviews/Ratings
- Worker Self-Service Login
- Chain multi-location / Receptionist Roles / Waitlists / Package Deals

## PM Note

I'd suggest building in roughly this order for a first working demo: **Epic 7 → Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 → Epic 6 → Epic 8/9.** Reasoning: an owner needs a salon set up (7) before there's anything to discover (1); the request/propose/respond loop (2–4) is the core value loop and should be proven end-to-end before layering reschedule (5), notifications (6), or trust/stats (8–9) on top. Flagging this as a suggestion, not a locked decision — happy to reorder if you see it differently.
