# Story map: STORY-97

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-97 |
| Source | `docs/stories/STORY-97.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-97.md` |

## Destination

Request Detail opens in a reusable right Aside over Zahtjevi (Kalendar, Kanban) or Zapisi without changing the URL. Pasted `/owner/requests/:id` redirects to Zahtjevi with the Aside open.

## Notes

- Consult: `docs/stories/STORY-97.md`, STORY-90 / STORY-91 keys
- Batch `batch/STORY-96-97`; grill round answered "all recommended"

## Decisions so far

- Close animates out (reverse slide + fade ~200ms); reduced motion fades only.
- Native `<dialog>` `showModal`: focus to X on open, back to the tapped card on close, focus stays in panel, page behind does not scroll.
- `/owner/requests/:id` fetches the booking, then `replace`-navigates to `/owner?date=…&salon=…` with the id in router state. Zahtjevi opens the Aside from that state and clears it at once, so refresh is closed. FORBIDDEN / missing → Zahtjevi with the Aside showing bounce copy.
- Cards become buttons; the Aside opens in place over the current board; the board refetches after mutations.
- New `components/Aside.tsx` (`open`, `onClose`, `title`, `headerExtra`, `children`). Request Detail body moves into a content component it renders. `SALON_PICKER_DIALOG_CLASS` is not used by Request Detail.

## Open decisions

## Not yet specified

## Out of scope

- Telefon and the guest picker stay modals
- Other owner modals moving to the Aside
- Booking rule changes
- Reopening the Aside after refresh
