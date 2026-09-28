# A phone booking is confirmed and has no customer

Salon phones still create the day’s rows. The caller agreed on the call and has no Esyres account, so they cannot sit in `requested` or answer a counter-proposal. The owner writes a phone booking that is born `confirmed`, with a caller name and no customer user, even when the phone matches an existing customer. It occupies a worker range like any confirmed booking.

Owner removal reuses `cancelled` (`docs/adr/0016-cancel-fifth-status.md`) so the calendar keeps one end status. That act is a phone booking cancel, not Cancel: only before the start, no trust counters (`docs/adr/0022-trust-counters-increment-on-event.md` still applies to customer cancel). After the start, no-show stays `confirmed` and increments the salon counter only (`docs/adr/0021-owner-marks-no-show-after-start.md`).

Zapisi uses the same salon switcher as Zahtjevi. ADR 0032 is unchanged: the salon catalog itself still has no `?salon=`.

Rejected: leaving it `requested` (nobody can accept it), requiring an Esyres customer on the call, a new status, deleting the row, and a worker login.
