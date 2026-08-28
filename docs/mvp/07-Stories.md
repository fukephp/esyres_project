# User Stories

*Representative stories per epic — enough to scope and start building, not an exhaustive backlog. Format: As a [user], I want [goal], so that [benefit].*

## Epic 1 — Salon Discovery & Profile Browsing

- As a customer, I want to see salons near my current location without logging in, so that I can start browsing immediately from a QR code or IG link.
- As a customer, I want a fallback list ("Popular in Sarajevo") when location is denied or unavailable, so that I never hit a blank screen.
- As a customer, I want to filter by service type (hair / make-up / massage) or search by name, so that I can find a relevant salon quickly.
- As a customer, I want to see a salon's services, prices, hours, and a busy-level badge on its profile, so that I can decide whether to request an appointment.

## Epic 2 — Booking Request Flow (Customer)

- As a customer, I want to select multiple services in one request, so that I don't need to submit separate requests for a haircut and a color.
- As a customer, I want to optionally pick a specific worker or say "no preference," so that I have control when I care, and less friction when I don't.
- As a customer, I want to pick a preferred day and time with a simple picker (no availability grid), so that the salon knows when I'd like to come without me guessing their schedule.
- As a customer, I want to create an account with email and password without a homepage login wall, so that I can browse first and sign in when I request or open My Bookings.
- As a customer, I want to verify my email before my request is sent, so that the salon can reach me with reminders.
- As a customer, I want to verify my phone with OTP before my request is sent (optional earlier, required at submit), so that the salon can SMS me if push fails.
- As a customer, I want confirmation that my request was sent and is awaiting salon response (accept or counter-propose), so that I know what to expect next.

## Epic 3 — Worker Availability Panel & Time Proposal (Owner)

- As an owner, I want to see all pending requests for a day in one queue, sorted so urgent ones aren't buried, so that nothing slips through.
- As an owner, I want to accept a guest's preferred time in one tap when it works, so that simple requests don't need an extra back-and-forth.
- As an owner, I want to drag a pending request onto an open slot on a worker's row to counter-propose a different time, so that I can adjust when the preferred time doesn't fit.
- As an owner, I want a tap-based fallback to the drag interaction, so that I can still manage requests from my phone.
- As an owner, I want to decline a request with an optional reason, so that the customer understands why without me needing to propose a time first.

## Epic 4 — Booking Lifecycle & Customer Response

- As a customer, I want to approve, reject, or ask for a different day or time once a counter-proposed time is offered, so that I stay in control of the final appointment. Asking for a different day or time updates the same request (new preferred date/time, back to pending), not a duplicate.
- As an owner, I want to be notified immediately when a customer responds to a proposed time, so that I can react (e.g. re-propose) quickly.
- As a customer, I want to see all my requests (Pending / Time Proposed / Confirmed / Declined) in one place, so that I can track their status.

## Epic 5 — Reschedule & Cancellation

- As a customer, I want to reschedule a confirmed booking without losing my original appointment until the new time is approved, so that I'm never left with nothing.
- As a customer, I want to cancel a booking and see a warning (not a block) if I'm cancelling late, so that I understand the impact without being locked out.
- As an owner, I want a configurable minimum cancellation notice window, so that late cancellations are visible in my stats.

## Epic 6 — Notifications

- As an owner, I want real-time push notifications for new requests and customer responses, so that I don't have to keep checking the app manually.
- As a customer, I want to be notified by SMS if a push notification doesn't reach me (e.g. on iOS), so that I don't miss a time-critical update.
- As a customer, I want a reminder email before my appointment, so that I don't forget it.

## Epic 7 — Salon & Service Management (Owner Onboarding)

- As an owner, I want to set my working hours, breaks, and cancellation notice window, so that the system reflects how my salon actually runs.
- As an owner, I want to add/edit services with durations and prices, so that customers see accurate options.
- As an owner, I want to add workers to my salon, so that customers can request them specifically or leave it open. Workers follow the salon’s hours.
- As an owner, I want to switch between salons I own, so that each shop has its own profile, queue, and QR without mixing them.

## Epic 8 — Trust Signal Data Foundations

- As an owner, I want to see when a returning customer physically scanned my QR code and verified, so that I know they're a real repeat visitor, not just a remote favorite.
- As the platform, I want to capture response-time and no-show data from day one, so that trust badges can be computed later without a backfill gap.

## Epic 9 — Basic Stats & Owner Insights

- As an owner, I want to see bookings per week, busiest hours, and cancellation rate, so that I can understand how my salon is actually running.
- As an owner, I want to see how many people scanned my QR code and how many converted into verified visits, so that I know if the sticker is working.

---

## Note

These stories reflect **locked MVP scope only**. Stories for Phase 2 items (badge display, Viber/WhatsApp, native app, etc.) are intentionally not written yet — writing them now would imply a commitment that hasn't been made.
