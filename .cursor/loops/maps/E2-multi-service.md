# Story map: E2-multi-service

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-multi-service |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to select multiple services in one request, so that I don't need to submit separate requests for a haircut and a color.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E2-multi-service.md` (after compile) |

## Destination

On shipped `/salon/:id`, a customer multi-selects services and sends one `createBooking`. Result: one `requested` row with `BookingService` snapshots. First booking mutation; picker and (later) Epic 10 share it. Not the whole of Epic 2.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 2, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- Code today: guest `/salon/:id` (name, week hours, services, today’s busy badge). No CTA. `login` exists. No `register`, `me`, Booking, or phone columns. `salon.workers` owner-gated. `busyLevel` occupancy hardcoded `0`. Slim Compose: php + node + mysql; no Redis. Verify: Behat + frontend typecheck/test/build + marketing build from `esyres_app/`.
- Architecture: `createBooking` needs Sanctum session + `email_verified_at` + OTP-verified phone. Behat may fixture `phone_verified_at` when OTP is not under test.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship Epic 10 chat, owner panel, or My Bookings in this PR
  - Do not weaken architecture 08 items 5–6 (OTP and email verify still required to send)
  - Invite-only: no public “Register salon”

## Decisions so far

- Epic 2 this story only: multi-service in **one** request (story text). Thin slices pulled in: native date+time on the profile, login-at-submit, same-page success, occupancy math. Worker pick UI, designed picker, public register, email-verify flow, phone OTP UI, and a dedicated confirmation screen stay sibling stories.
- Guest browse stays without a homepage login wall. Trust-badge display is Phase 2. Chat is Epic 10. QR hold cookie is Epic 8.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest, not `php artisan test` as the gate. PWA keeps React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Status machine: this PR only creates `requested`. `requested` does not occupy a clock slot (`docs/architecture/05-Data-Model.md`, 08 decision 33).
- Money stays integer feninga. Dates: `preferred_date` is Sarajevo `YYYY-MM-DD`; `preferred_starts_at` is UTC from that date + local time. `APP_TIMEZONE=Europe/Sarajevo` already in `.env.example`.
- Duration derived from selected services (sum, rounded up to 15 minutes) per data model.
- E1 omitted `Pošalji zahtjev` on purpose; this story adds the picker CTA on `/salon/:id`.
- **Send gates (2026-08-30):** server enforces Sanctum session + `email_verified_at` + `phone_verified_at`. UI: login-at-submit via existing `login`. Behat fixtures set both timestamps (architecture 03 allows this when OTP is not under test). Add nullable unique `phone` + `phone_verified_at`. No register, verify-mail, OTP mutations, Redis, or SMS this PR. Architecture 08 items 5–6 stay; OTP UI is the sibling story. ADR: `docs/adr/0002-createbooking-gates-without-otp-ui.md`.
- **Worker (2026-08-30):** `createBooking` accepts optional `workerId` (`null` = no preference). Picker does not show workers and does not ungate `salon.workers`. Worker pick is the next E2 story.
- **Picker chrome (2026-08-30):** stay on `/salon/:id`. `Pošalji zahtjev` turns the service list into multi-select and reveals native date + time (15-minute `step`). No new route, no sheet, no week-busy strip. Empty catalog: no or disabled CTA. Stack duration + KM total while selecting. Designed picker polish is sibling E2-day-time-picker.
- **Time rules (2026-08-30):** client sends `preferredDate` (`YYYY-MM-DD` Sarajevo) + `preferredTime` (`HH:mm`). Server stores `preferred_date` and `preferred_starts_at` (UTC). Reject: empty/foreign services, closed weekday, past datetime (Sarajevo). Allow a time on an open day even in a break or outside hours — preference, not a held slot.
- **Success (2026-08-30):** same `/salon/:id` page, Bosnian “zahtjev poslan / salon će odgovoriti”. Not My Bookings (E4). Dedicated confirmation screen stays sibling E2-request-sent.
- **Occupancy (2026-08-30):** replace the `0` stub. Booked minutes that calendar day (`requested` + `time_proposed` + `confirmed`; not `declined`) / open minutes that weekday (minus break), cap 100, then existing `BusyLevel::fromPercent`. Closed or 0 open minutes → `LOW`.
- **Mutation (2026-08-30):** handwritten `createBooking(input: CreateBookingInput!): Booking!`. Input: `salonId`, `serviceIds: [ID!]!`, optional `workerId`, `preferredDate`, `preferredTime`. `Booking` returns `id`, `status` (`REQUESTED` this PR), `preferredDate`, `preferredStartsAt`, `durationMinutes` (sum rounded up to 15), snapshot `services { name durationMinutes priceFeninga }`. No bookings list query. Duplicate, empty, or foreign `serviceIds` → `INVALID_SERVICES`. Foreign `workerId` → `INVALID_WORKER`. Other codes: `UNAUTHENTICATED`, `EMAIL_UNVERIFIED`, `PHONE_UNVERIFIED`, `SALON_CLOSED`, `PAST_TIME`, `INVALID_DATE`, `INVALID_TIME`. SPA maps codes to Bosnian. No `me` query: try the mutation, react to codes. On `UNAUTHENTICATED`, inline email+password, `login`, retry. On unverified email/phone, Bosnian error only.
- **Copy (2026-08-30):** Bosnian i18n keys for CTA, stacked total, gate errors, success. Exact wording is not a machine check beyond the success/CTA existing; visual via PR screenshots.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Salon Booking Assistant chat (Epic 10)
- Owner panel / accept / propose / decline (Epic 3)
- My Bookings / customer respond (Epic 4)
- Public register, verify-mail UI, OTP mutations, Redis, SMS (sibling E2; fixtures only this PR)
- Worker pick UI and guest `salon.workers` (sibling E2; mutation still accepts omitted `workerId`)
- Week busy strip and designed picker polish (sibling E2-day-time-picker)
- Photos, address, slug, maps link
- QR hold cookie (Epic 8)
- Notifications / Reverb (Epic 6)
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest, `/owner`
- Full architecture-07 compose (nginx, redis, reverb, mailpit) unless already present
- Native apps, payments, worker logins, Inertia
- Public owner registration
