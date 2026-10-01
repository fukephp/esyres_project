# Always-on Pošalji zahtjev

Radno vrijeme on the salon profile is information: a read-only week. One `Pošalji zahtjev` after that list opens the request modal. Guests were missing the send control because it appeared only under a tapped weekday, and the native date popup was closing the dialog. Zatvori is the only dismiss, so a date choice and the final send stay on screen. A logged-out guest signs in inside the modal, then fills the form. Day choice is Danas, Sutra, or Drugi dan; the time is still a tapped quarter. Pitaj salon is not on the profile. Owner Telefon is unchanged.

Rejected: keeping the day-tap pill, copying Telefon’s typed Drugi dan time, and closing on Escape, backdrop, or a successful send. Supersedes the guest day-first half of `docs/adr/0034-day-first-salon-booking-chrome.md` (homepage Moje rezervacije stays) and the “Escape / backdrop still idle” line of `docs/adr/0036-native-date-time-must-not-dismiss-salon-overlay.md` for this modal. STORY-89.
