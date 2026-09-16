# STORY-59 — One idle Pošalji zahtjev; md+ booking sidebar

| Field | Value |
|-------|--------|
| ID | STORY-59 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-59` |
| Depends on | STORY-47, STORY-48 |

## User story

As a customer, I want a single send on the salon profile — under the title on a phone, in a sticky sidebar on a wide screen — so that I am not looking at two identical buttons.

## Acceptance criteria

- Guest `/salon/:id` has **one** idle `Pošalji zahtjev`. Never the STORY-47 pair (header under the title **and** lower above chat) on the same view.
- Stack: TopNav unchanged. Title + today’s busy span the guest column. Address line if set (omit if missing). Then:
  - **Phone (`<md`):** that send block sits under the title, then hours, then services, then picker/chat form. One column. Not sticky.
  - **`md+`:** two columns **inside** the existing ~1200px guest column. **Left:** hours → services → picker/chat form (left-aligned `max-w-md`). **Right:** compact booking sidebar (narrower than `max-w-md`; the idle pill spans **that** column). Title, busy, and address stay above the split.
- Sidebar / under-title block is idle booking chrome only: `Pošalji zahtjev`, hint `Odaberi usluge, dan i vrijeme.` when idle, and `Nisi sigurna? Pitaj salon.` Not an hours rail, not the owner aside, not picker/chat/gates.
- Show/hide (today’s **lower** rules on this one control): send when the salon has services, not picking, and not sent (idle + chat → `openIntake('picker')`). Chat alternate when it has services, not chatting, and not sent (idle + picker). Hint only when idle. Hide both when sent or when there are no services.
- `md+` sidebar is `sticky` inside `main` while hours/services scroll. Not a floating dock. Not a sticky TopNav. Phone: never sticky.
- Service category jump list stays inside the left services block (`md+` when ≥2 visible groups). Do not move it into the booking sidebar.
- Hours stay a seven-row list in the **left** column (weekday left, hours/break or Zatvoreno right). Open rows still seed the picker (STORY-47). Closed muted. No right schedule rail.
- Picker and chat stay after services in the left column. Service checkboxes stay in the catalog when picking. Send or an hours tap that opens/stays on the picker still scrolls the form into view. Chat alternate does not scroll.
- **Sent**, **no services**, loading, or missing salon: no sidebar column (left content spans the guest column). Success copy stays after the catalog/form. Login / email / phone gates stay in the left form measure.
- Chrome: one idle send, picker submit, and chat submit share the STORY-48 black pill (Inter 600 14px, min-height 48px, press `#242424` + `scale-[0.98]`, ink focus ring, disabled `#e5e7eb`). Idle pill width is the compact sidebar (phone: the under-title measure), not a second `max-w-md`. Picker/chat submit stay full width of the left `max-w-md`. CSS only. No second CTA color, no icon, no GSAP.

## Out of scope

- Hours rail / moving weekly hours into the sidebar
- Sticky TopNav, phone dock, or relocating the picker/chat form above hours
- Photo, gallery, description, maps
- Owner surfaces, discovery, homepage
- Changing picker vs chat mutual exclusion, `createBooking`, or send gates
- Awwwards / GSAP / Three.js
- Public pricing page
