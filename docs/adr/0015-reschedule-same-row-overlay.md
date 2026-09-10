# Reschedule is an overlay on the same confirmed booking

Reschedule of a confirmed booking must keep the original occupied range until the owner accepts the new time. `askOtherTime` cannot be reused: it flips the same row to `requested` and stops occupying. A child `requested` row would split identity and busy-level. Status stays `confirmed`; the asked new day/time lives on that row as an overlay that does not occupy. The pending queue lists that overlay on the new preferred day, tagged. Owner accept moves the confirmed clock; dismiss clears the overlay and keeps the original.
