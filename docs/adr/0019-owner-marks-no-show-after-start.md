# Owner marks a no-show after start

A confirmed booking that is already past start cannot be cancelled (`PAST_START`). Auto-marking every still-confirmed row would count customers who attended. QR visit is reconnect, not attendance. The owner writes the no-show with a mutation after `preferred_starts_at`. Cancel never becomes a no-show.
