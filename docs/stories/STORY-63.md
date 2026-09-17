# STORY-63 — Salon chat overlay chrome

| Field | Value |
|-------|--------|
| ID | `STORY-63` |
| Epic | 10 — Salon Booking Assistant (scripted intake) |
| Loop | `STORY-63` |
| Depends on | STORY-62, STORY-21 |

## User story

As a customer, I want Pitaj salon to open a full-canvas chat overlay so I can talk to this salon without the hours list competing with the conversation.

## Acceptance criteria

- Pitaj salon stays a hairline `surface-soft` card under Radno vrijeme (after the pill slot). Tap opens chat. Card stays selected (`surface-soft`) while the overlay is open. Not a black pill. Overlay blocks the card while either dialog is open.
- Chat lives in a native `<dialog>` overlay, mutually exclusive with the picker. Phone: full-viewport canvas sheet. `md+`: centered `max-w-md` card. Reuse `SALON_PICKER_DIALOG_CLASS` (or a shared alias). Overlay, Escape, and backdrop close → idle (card unselected). Opening chat hides `Pošalji zahtjev` and closes the picker.
- Overlay header is X (or existing `salon.close`) top-right. **No title.** Empty greeting can sit truly centered.
- Empty (no service selected and not waiting): flex-centered Cal display greeting `{{name}} ovdje.` (salon voice — not a time-of-day guest greeting). Muted address under it when set. **No logo or mark.**
- Thread (any chip/answer): salon lines unbubbled left Inter body; guest answers light gray right pills (`surface-soft` or `surface-card`, ink text, `rounded-3xl`). No salon `surface-soft` bubbles. No guest `ink` bubbles. No on-page `min-h-[70dvh]` thread under the card.
- Bottom composer is a dummy rounded-full pill: decorative `+` (`aria-hidden`), placeholder `Kako ti možemo pomoći?`. Not a textarea. No mic, model picker, attachments, or free-text NLU.
- Current-step controls (service chips, worker, date, times, other, unknown, ping, send pill, auth gates) sit in a wrapping **suggestion row above the composer**. Not in the centered empty hero. Not in the scroll thread. Send stays the STORY-48 black pill.
- In-flight cookie restore opens this overlay (not an on-page thread). Hours tap while the overlay is open: close overlay, select that day, show the pill (STORY-62).
- `createBooking`, send gates, scripted steps, Bosnian copy keys, and picker vs chat mutual exclusion unchanged.

## Out of scope

- LLM / free-text NLU
- Mic, attachments, model picker, hamburger / upgrade / share top bar, logo/mark
- Owner `/owner/chats` chrome
- Filling the empty aside
- Changing the picker form
- Changing `createBooking` or send gates
- Public pricing page, GSAP / Awwwards / Three.js
