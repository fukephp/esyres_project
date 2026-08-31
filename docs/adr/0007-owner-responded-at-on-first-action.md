# Capture owner response time on first accept, counter-propose, or decline

Fast Responder **display** is Phase 2, but response time must be captured from the first owner action so later badges have no backfill gap. `bookings.owner_responded_at` is set once, on the first successful `acceptPreferredTime`, `proposeTime`, or `declineBooking`. Failed overlap / missing-worker / not-requested does not write it. It is not “time to fully confirmed” when a counter-propose loop is involved. Amended 2026-08-31: owner decline from `requested` also stamps (ADR 0010).
