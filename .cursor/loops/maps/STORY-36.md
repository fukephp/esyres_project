# Story map: STORY-36

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-36 |
| Source | `docs/stories/STORY-36.md` |
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-36.md` (after compile) |

## Destination

An owner of the selected salon can open a Basic Stats screen and see bookings per week, busiest hours/days, day-level busy percent, and cancellation rate. Customer routes never show this screen.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (02, 03, 04, 06, 07, 08), `docs/architecture/` (03, 04, 05, 08), `docs/adr/0016-cancel-fifth-status.md`, `docs/stories/STORY-36.md` plus STORY-08 / 14 / 30 / 35 / 37, `docs/glossary.md` (**Busy-level**, **Late cancel**, **Cancellation notice window**), `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`):
  - `Occupancy::percent($salon, $date)` = booked minutes (`requested` + `time_proposed` + `confirmed` on `preferred_date`) / open minutes that weekday, capped 100. Closed day → 0. Does not multiply by worker count. Does not subtract holidays. `cancelled` is excluded.
  - Guest GraphQL `salon.busyLevel(date)` returns `LOW | MEDIUM | HIGH` only (`BusyLevel::fromPercent`; placeholders `<50` / `50–85` / `>85`). Integer percent is not on the schema.
  - Cancel already snapshots `cancelled_at` + `late_cancel` (STORY-30). No owner stats query or `/owner/stats` route. `OwnerNav` is queue + chats only.
  - Owner queries use `OwnerAccess` (session + verified email + owns salon). Guest `pendingBookings` stays forbidden.
- Standing preferences:
  - Same busy math as the customer badge (`docs/architecture/03` Epic 9). Do not retune `Occupancy` or thresholds this PR (`docs/mvp/08` placeholders stay).
  - Numbers + ranked lists, not a chart library (Design 2 is owner-dense, not a dashboard IA clone).
  - Bosnian-first i18n. Design 2 owner chrome (dark nav). Salon context is `?salon=` like `/owner/chats`.
  - Behat GraphQL-over-HTTP in the owner suite. No Playwright, Pest, codegen, `vite-plugin-pwa`.
  - Do not add redis / nginx / worker / mailpit this PR.

## Decisions so far

- STORY-36 is the **owner Basic Stats screen** for one selected salon. QR scan/conversion is STORY-37. Revenue is deferred. Trust badge display is Phase 2. Customer-facing dashboards are out.
- Home after owner login stays pending queue + Worker Availability Panel (`/owner`). Stats is a separate owner surface, not screen 1 (`docs/mvp/04`).
- Route: `/owner/stats`, lazy owner chunk like `/owner/chats`. `?salon=` when the owner has more than one salon; omit or bad id → first owned (`id` ASC). `OwnerNav` gains a stats link. Customer `App.tsx` routes (`/`, `/salon/:id`, `/bookings`) never mount this page.
- Auth: same `OwnerAccess` as `pendingBookings` / `inFlightIntakes`. Guest / other owner / unverified-email owner → `UNAUTHENTICATED` / `FORBIDDEN` / `EMAIL_UNVERIFIED`. No public `busyPercent` on guest `salon`.
- Day-level busy percent **formula** is `Occupancy::percent` unchanged. Customer UI still renders only the enum. Owner stats is the first place the integer percent is shown.
- Late-ness stays the STORY-30 snapshot (`late_cancel`). Do not recompute from current notice hours (`docs/adr/0016`).
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat + Vitest/typecheck/build. No REST. No salon/user counter increment this PR (STORY-35).

## Open decisions

- **Window** — which Sarajevo days do “per week” / rate / busiest cover? (picker vs fixed)
- **Bookings-per-week count** — which statuses, keyed on which date column
- **Cancellation rate** — numerator / denominator; whether late is a second number

## Not yet specified

- Busiest hours/days: bucket size (hour vs 15-minute), which clock (preferred vs occupying start), ranked list length — waits on window + status set
- Which days list day-level busy percent (today only vs every day in the window) — waits on window
- GraphQL payload shape (`salonStats(salonId)` vs fields on `Salon`) — waits on the three metric definitions
- Empty / zero-denominator copy

## Out of scope

- QR scan count and scan→verified-visit (STORY-37)
- Trust badge display (Phase 2)
- Revenue tracking (deferred in `docs/mvp/08`)
- Customer-facing stats / dashboards
- Changing `Occupancy` math or busy-level thresholds
- Owner settings (hours, notice window, workers, services)
- No-show counters UI (STORY-35 capture)
- Charts / analytics vendor
- Playwright, Pest, GraphQL codegen, `vite-plugin-pwa`
- New Compose services
