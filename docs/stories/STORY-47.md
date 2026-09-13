# STORY-47 — Salon profile address, header CTA, tappable hours

| Field | Value |
|-------|--------|
| ID | STORY-47 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | STORY-07, STORY-08, STORY-21, STORY-45 |

## User story

As a customer, I want the salon profile to show the address when it exists, a send button under the title, and tappable open hours that fill the picker’s day, so that I can start a request from what I already see.

## Acceptance criteria

- `/salon/:id` stack, still one guest column (no right hours rail): (1) title + today’s busy, (2) address line if set, (3) header `Pošalji zahtjev` when idle and the salon has services, (4) weekly hours (seven rows, weekday left, hours/break or Zatvoreno right), (5) services, (6) lower `Pošalji zahtjev` + `Nisi sigurna? Pitaj salon.` when idle. Picker, chat, and both CTAs stay left-aligned `max-w-md`. Name, busy, address, hours, and services span the column.
- Address is guest **read** of existing public `salon.address`. Trim; null/whitespace omits the line (same as discovery). Bare body/muted line, no “Adresa” heading, no maps link, no lat/lng, no owner editor.
- Header `Pošalji zahtjev` calls today’s `openIntake('picker')`. Hide it while picking, chatting, or sent, and when there are no services. Lower button + chat alternate stay as they are now.
- After the header CTA, or an hours tap that opens or stays on the picker, scroll the picker form into view. Chat alternate does not scroll. No sticky bar.
- Closed weekday: muted text, not a button. No picker open, no date write, no toast.
- Open weekday is a whole-row button only when the salon has services **and** mode is `idle`, `picker`, or `chat`. Never a button when `sent`, loading, missing salon, or no services.
- Open-row tap: `mode = picker`; set picker `preferredDate` to the next Sarajevo calendar date of that weekday (today if it is that weekday). Do not set time: idle keeps time empty; picker already open keeps whatever time they typed (or empty). No after-close skip to next week. Native date input still works. Re-tap of the selected open row is a no-op.
- Hours tap while chatting: same as a picker open (`mode = picker` + picker `preferredDate`). Leave chat snapshot and intake token. Do not copy chat services, worker, date, or time into the picker. Do not ping or abandon intake.
- Selected chrome (`surface-soft`) on the open row whose weekday matches `preferredDate`, including after they change the date input. If `preferredDate` is a closed weekday, no row is selected. Hover/focus on tappable rows: `surface-soft`. Hours stay a seven-row list, not a chip strip. Cal tokens only; busy dot stays the only extra color.
- Send gates, busy badge, services, chat copy, and `createBooking` unchanged.

## Out of scope

- Photo, gallery, description
- Nearby / same-location substitute strip
- Favorite / like UI, guest login popup on like
- Meet the team / worker bios
- Guest benefits notice
- Two-column salon or right schedule rail
- Maps link-out, lat/lng, owner address editor (STORY-41)
- Seeding address on demo salons
- Week chips, slot grid, sticky top-nav
- `Pošalji zahtjev` chrome and header support line (STORY-48)
- Awwwards / GSAP / Three.js
- Public pricing page
