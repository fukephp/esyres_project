# Story map: E3-tap-fallback

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-tap-fallback |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want a tap-based fallback to the drag interaction, so that I can still manage requests from my phone.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E3-tap-fallback.md` |

## Destination

A verified owner on a phone can counter-propose without dragging: open Request Detail from a pending row and submit a form that calls the same `proposeTime` as drag. Accept preferred time and decline stay available on that screen via the existing mutations.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Request Detail, Worker Availability Panel), `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 3, `docs/architecture/` (03, 04, 05, 06, 08 #29), `docs/glossary.md`, `docs/adr/0008-drag-always-proposetime.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “Tap/form Request Detail — last Epic 3; phone owners still need a non-drag propose path”
- Code today (`esyres_app/`): `/owner` lazy queue + panel; Prihvati (`acceptPreferredTime`, named worker only); drag → `proposeTime(bookingId, workerId, proposedTime HH:mm)` on `preferred_date` only; Odbi two-step on every row (`declineBooking`). PointerSensor `distance: 8`. No Request Detail route. No `booking(id)` owner query. No assistant origin/transcript. No Playwright, codegen, Reverb.
- Architecture 04: tap/form fallback calls the same `acceptPreferredTime` and `proposeTime`; UX constraints still say “no Request Detail” (this story patches that). 08 #29: `@dnd-kit` — same mutation as tap fallback. ADR 0008: drag never accepts; form still calls both mutations.
- Drag map parked **cross-day propose** on this sibling. Drag itself is same-day (queue date = panel date). `ProposeTime.php` binds start to `preferred_date`.
- Glossary now has **Request Detail**. Epic 10 assistant tag + collapsed transcript lives on this screen later — not this PR unless Destination is redrawn.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Same mutations as queue/panel (08 #29)
  - Invite-only: no public “Register salon”
  - Lazy `/owner` chunk (architecture 08 #10)
  - One story → one PR: do not swallow Epic 10 transcript or a `proposeTime` date-arg rewrite unless Destination is redrawn

## Decisions so far

- **Slice (2026-09-01):** UI-only Request Detail. Form calls existing same-day `proposeTime(bookingId, workerId, HH:mm)`. Prihvati / Odbi on that screen reuse `acceptPreferredTime` / `declineBooking`. No new mutations. No date arg on `proposeTime`. No accept-with-worker for no-preference (`WORKER_REQUIRED` stays). Cross-day propose and Epic 10 transcript stay out.
- **Surface (2026-09-01):** `/owner/requests/:id` in the same lazy owner chunk as `/owner`. Not a sheet, not row-expand. New owner query `ownerBooking(id: ID!): Booking!` — `OwnerAccess` like pending; missing or other salon → `FORBIDDEN`; guest / unverified same codes as pending. Returns the row even if no longer `requested` so the screen can bounce. Not nested on public `salon`. Not a customer `booking(id)`.
- **Queue actions (2026-09-01):** Prihvati and Odbi stay on every pending row (same as today). Request Detail also has them. Do not strip queue actions this PR.
- **Open chrome (2026-09-01):** Predloži on every pending row (named worker and no preference) is a `Link` to `/owner/requests/:id`. Row stays the drag handle. Not tap-the-row, not Detalji.
- **Form (2026-09-01):** Date = `preferred_date`, read-only. Preferred time shown as context. Worker required `<select>` (prefill named; no-preference placeholder “Odaberi radnika”). Time = 15-min `<select>` of droppable start cells for that weekday (open-minus-break, not occupied, not off) via existing panel helpers — not `type=time`, not a mini grid. Duration overflow is not client-blocked; mutation `SLOT_TAKEN` / `OUTSIDE_HOURS`. Zero workers → “Nema radnika.” Closed day → “Zatvoreno ovaj dan.” Submit off. Submit Predloži → `proposeTime`. Occupying for that preferred date + salon hours/workers loaded on the screen.
- **After success (2026-09-01):** accept / propose / decline → `/owner` for that booking’s `preferred_date` (`?date=` only if not Sarajevo today, same as the date picker). Failed mutation stays on Request Detail with existing error copy. Status not `requested` → bounce copy + Nazad, no form. Nazad always on the screen.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Cross-day propose / `proposeTime` date argument
- Accept-with-worker for no-preference (`WORKER_REQUIRED` stays)
- Assistant origin tag + collapsed transcript (Epic 10)
- Keyboard-dnd / `@dnd-kit` KeyboardSensor
- Customer Time Proposed / My Bookings (Epic 4 already shipped)
- Status notifications (Epic 6)
- In-flight chat tab, Take over (Epic 10)
- Salon switcher chrome (Epic 7)
- Changing `acceptPreferredTime` hours behavior
- Request auto-expire job / TTL
- Reverb / nginx / redis / mailpit in slim Compose
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Public owner registration; worker logins; payments; Pest
- Trust badge **display** (Phase 2)
