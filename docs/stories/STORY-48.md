# STORY-48 — Salon Pošalji zahtjev chrome

| Field | Value |
|-------|--------|
| ID | STORY-48 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-48` |
| Depends on | STORY-47 |

## User story

As a customer, I want every Pošalji zahtjev on the salon profile to look and feel like one primary action, so that sending a request is obvious and the press feels physical.

## Acceptance criteria

- All four `Pošalji zahtjev` (idle header, idle lower, picker submit, chat submit) share one chrome: black pill, Inter 600 14px white label, min-height 48px, full width of the left-aligned `max-w-md`. Press: fill `#242424` and `scale-[0.98]`. Focus-visible: ink ring. Disabled submit: `#e5e7eb`. CSS only. No icon, no pulse, no morph-to-form, no sticky dock, no second CTA color.
- Idle header and idle lower still only `openIntake('picker')` + scroll (STORY-47). Submit still sends. Behavior, gates, and hide/show rules unchanged.
- When the header idle button is shown, one muted support line under it: `Odaberi usluge, dan i vrijeme.` Not under the lower idle button or either submit.
- Chat alternate stays the underline `Nisi sigurna? Pitaj salon.` — not a second primary.

## Out of scope

- Address, tappable hours, header CTA placement (STORY-47)
- Restyling AuthShell, owner, or My Bookings pills
- Sticky top-nav / dock
- Awwwards / GSAP / Three.js
- Photo, gallery, description
- Public pricing page
