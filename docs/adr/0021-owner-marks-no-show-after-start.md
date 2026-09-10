# Owner marks a no-show after start

A confirmed booking that is already past start cannot be cancelled (`PAST_START`). Auto-marking every still-confirmed row would count customers who attended. QR visit is reconnect, not attendance. The owner writes the no-show with a mutation after `preferred_starts_at`. Status stays `confirmed`; stamp `no_show_at`; the row still occupies; an in-progress overlay is cleared. Not a sixth status. Cancel never becomes a no-show. A second mark is a no-op (no second increment).
