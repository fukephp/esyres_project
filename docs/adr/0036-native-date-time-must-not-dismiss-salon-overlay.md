# Native date/time must not dismiss the salon overlay

For the guest request modal, Zatvori is the only dismiss (`docs/adr/0042-always-on-posalji-zahtjev.md`). Escape and backdrop do not idle it. The date popup still must not.

Native `type="date"` / `type="time"` inside a salon `<dialog>` can fire the dialog’s `cancel`/`close` (especially iOS Safari). Choosing a calendar date must keep the overlay mounted (last busy until the new day’s busy arrives). Prevent that `cancel` when a date control is active, and re-`showModal()` if the dialog still closed while the request modal is open. Rejected: replacing native date with text/`select` or a custom calendar; unmounting the salon profile on date loading.
