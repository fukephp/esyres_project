# STORY-62 — Day-first salon chrome; homepage Moje rezervacije

| Field | Value |
|-------|--------|
| ID | `STORY-62` |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `—` |
| Depends on | STORY-43, STORY-47, STORY-48, STORY-59, STORY-21 |

## User story

As a customer, I want to start a salon request from Radno vrijeme and reach Moje rezervacije from the logged-in homepage, so that send is not sitting idle on load and bookings are one tap from `/`.

## Acceptance criteria

- Logged-in `/` top-nav order: display name → Moje rezervacije (same `nav.bookings` text link to `/bookings` as `/salons`) → Odjava → Panel. Every logged-in visitor (owners included). Guest `/` stays Prijava / Registracija / Panel. `/bookings` still has no Moje rezervacije self-link. `/owner*` still has no Moje rezervacije.
- Guest `/salon/:id` keeps the `md+` two-column split inside the ~1200px guest column. Right aside is **empty** (`md:w-64` sticky gutter). No CTA, hint, or chat in the aside. Phone: empty aside has no height. **Sent**, **no services**, loading, or missing salon: no split (left content spans the guest column).
- Hours block in the left column, in order: `Radno vrijeme` heading; helper `Odaberi dan da pošalješ zahtjev.` (stays after a day is selected); seven-row list; `Pošalji zahtjev` pill **only after** an open weekday is selected; Pitaj salon card; chat thread when chatting.
- Open weekday tap: select row + seed next Sarajevo date of that weekday. Re-tap selected = noop. Other open day switches. Does **not** open the picker modal. Closed rows stay muted, not tappable. Hours tap while chatting: leave chat, select that day, show the pill (no modal yet).
- Idle `Pošalji zahtjev` is **not** on the page at load (not under the title, not in the aside). Show the pill when `preferredDate` is set, the salon has services, not chatting, and not sent. Pill click opens the booking modal. Close without send keeps the day + pill. Same STORY-48 black pill (Inter 600 14px, min-height 48px, press `#242424` + `scale-[0.98]`). CSS only. No GSAP.
- Booking modal is a native `<dialog>`. Title is the salon name. Body is the full picker: service checkboxes, worker, seeded date, time, send, and auth gates. Phone: full-viewport canvas sheet. `md+`: centered `max-w-md` card. Overlay, X, and Escape close. Date stays editable; changing it updates hours selected chrome. Picker submit stays the same black pill. First dialog in this PWA.
- Page services catalog is **browse-only** (groups, names, KM, duration, `md+` jump list when ≥2 visible groups). Checkboxes live only in the modal.
- Pitaj salon is a hairline `surface-soft` card under the hours list (after the pill slot): support line `Reci nam što ti treba.`, action `Nisi sigurna? Pitaj salon.` (Inter 600) + chevron, press `scale-[0.98]`. Not a black pill. Opens chat on the page (not in the modal). Opening chat hides the pill, closes the modal, thread expands under the card; card stays selected (`surface-soft`). Overlay blocks the card while the modal is open. Chat thread is messenger chrome: salon bubbles left (`surface-soft`), guest answers right (`ink`), greeting when empty, bottom composer placeholder `Kako ti možemo pomoći?` (scripted chips still drive the flow — no free-text NLU).
- `createBooking`, send gates, and picker vs chat mutual exclusion unchanged.

## Out of scope

- Filling the empty aside (photos, hours rail, pending status)
- Slot grid, sticky TopNav, phone dock, GSAP / Awwwards / Three.js
- Rebook-last, closed-day chat, English “my reservation”
- Owner nav / overlay changes
- Changing `createBooking` or send gates
- Public pricing page
