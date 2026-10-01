# Story map: STORY-90

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-90 |
| Source | `docs/stories/STORY-90.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-90.md` |

## Destination

`/owner/requests/:id` is a phone sheet / `md+` card over the board the owner came from. Zatvori, backdrop, and Escape return there. A paste or refresh has no came-from and sits on Zahtjevi for that booking’s salon and `preferred_date`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-90.md`, `docs/mvp/04-UI-Design-Goals.md`
- Grill Q1 = option 1

## Decisions so far

- Came-from is `location.state.board` (pathname + search). It is not a query param. Refresh drops it.
- Paste or refresh: Zahtjevi for the booking’s salon on `preferred_date`. Zatvori goes there.
- Accept, decline, and counter-propose refetch the booking and leave the dialog open.
- Salon switcher is hidden while the dialog is open.
- No Nazad. Zatvori is `salon.close`.
- Loading and auth stay the existing uncarded screens. Bounce copy for a missing or forbidden row stays inside the card.
- Assumed: a missing or forbidden paste with no booking row uses Zahtjevi for today and the first salon, with the bounce copy in the card.

## Open decisions

## Not yet specified

## Out of scope

- Assign-worker taps (STORY-91)
- Day-only copy (STORY-92)
- Accept, propose, or decline rules
- Customer My Bookings
- Telefon close-on-save behavior
