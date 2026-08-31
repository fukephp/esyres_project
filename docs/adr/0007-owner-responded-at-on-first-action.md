# Capture owner response time on first accept or counter-propose

Fast Responder **display** is Phase 2, but response time must be captured from the first owner action so later badges have no backfill gap. `bookings.owner_responded_at` is set once, on the first successful `acceptPreferredTime` or (later) `proposeTime`. Failed overlap / missing-worker does not write it. It is not “time to fully confirmed” when a counter-propose loop is involved.
