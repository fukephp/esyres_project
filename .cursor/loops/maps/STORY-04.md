# Story map: STORY-04

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-04 |
| Source | `docs/stories/STORY-04.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-04.md` |

## Destination

An owner who owns more than one salon can put one salon in context on owner home. Queue, panel hours, and workers for that salon do not mix with another they own. A single-salon owner still uses `/owner` with no switcher.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 06), `docs/architecture/` (04, 05, 08 #22), `docs/stories/STORY-04.md`, `docs/glossary.md` (Salon / Owner / Salon switcher / Pending queue / Worker Availability Panel), `DESIGN.md`, `refs/design-2/DESIGN.md` (dark left nav: salon switcher if multi-salon)
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): `me { salons { id name } }` already returns owned salons, `id` ASC (Behat `pending_queue.feature`). `OwnerAccess` scopes pending, occupying, hours, services, workers by `salonId`. `/owner` and `/owner/requests/:id` both take `data?.me?.salons[0]`. Owner home queries `pendingBookings` / `occupyingBookings` / `salon` for that first id. Request Detail gates on first salon then loads the booking’s `salon.id`. No owner settings routes. No QR owner UI (STORY-34). No Playwright. Vitest covers `lib/owner` helpers. `ownerQueuePath` only carries `date`.
- AC also names hours, workers, services, QR isolation. Hours/workers already appear on the panel for whichever salon id is queried. Services/QR have no owner screens. Guest `/salon/:id` is already one profile.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not invent chain multi-location or shared workers
  - Do not add receptionist/manager roles
  - Do not add public “Register salon”
  - Do not add hours/services/workers/QR owner screens
  - No localStorage last-used salon; no GraphQL “active salon”
  - Invite-only provision stays as-is

## Decisions so far

- STORY-04 is owner chrome: switch which salon is in context. Not a chain “one brand, many locations” product (`docs/mvp/03-Key-Features.md`, architecture 08 #22).
- Receptionist / manager roles stay Phase 2. Public salon registration stays out. Customer-facing salon picker for owners stays out (`docs/stories/STORY-04.md`).
- Backend already lists owned salons and forbids mixing via `OwnerAccess` + per-`salonId` queries. This story does not add a second GraphQL style.
- E3 pending-queue locked `/owner` to first salon by `id` ASC and deferred switcher chrome. That first-salon hardcode is the bug.
- Single-salon owner: no switcher required to use owner home (story AC).
- Each salon stays a separate guest profile (`/salon/:id`). No shared workers across sites this PR.
- Bosnian-first i18n (`bs`, no language switcher). Design 2 owner dense: dark left nav is where a multi-salon switcher belongs on desktop.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, Vitest/typecheck/build. No Playwright unless a check cannot name another verifier. No Pest, no codegen, no `vite-plugin-pwa` this PR.
- **Slice (2026-09-02):** chrome only on `/owner` and `/owner/requests/:id`. Selected salon drives pending queue + Worker Availability Panel (hours and workers on that board). Do not invent owner settings or QR UI. Isolation for those is already per-salon rows; guest `/salon/:id` is already one profile.
- **Context storage (2026-09-02):** URL only. `/owner?salon=<id>` next to existing `date`. Omit `salon` → first owned by `id` ASC. No `localStorage`. No GraphQL active-salon field. Resolve owned id client-side before queue/panel queries (unowned id would be `FORBIDDEN`).
- **Bad `salon` param (2026-09-02):** unknown, garbage, or not owned → first owned by `id` ASC. Same as invalid `date` → today. Do not query the bad id. No error page.
- **Request Detail (2026-09-02):** no switcher. Show the booking’s salon name. Owner gate is `me.salons.length > 0`, not `salons[0]`. Back to queue is `/owner?salon=<booking.salon.id>` plus `date` as today (omit `date` when today). Switcher lives on `/owner` only.
- **Chrome control (2026-09-02):** native `<select>` of salon names, only when `me.salons.length > 1`. One salon keeps the static name. No custom dropdown, no nav button list.
- **Phone layout (2026-09-02):** same select in two places. Desktop: dark left nav (replaces the static name). Phone: top of main, where the salon name already sits (`md:hidden`). No bottom nav. Do not unhide the sidebar on phone.
- **Date when switching (2026-09-02):** keep the current `date` query. Salon and day are independent. Omit `date` only when it is Sarajevo today (existing rule).
- **Verifiers (2026-09-02):** Vitest on salon-from-search + `ownerQueuePath` (omit `salon` when first owned). Existing Behat suite only (no new GraphQL). One human-only: PR screenshots desktop+mobile, 2+ salons (select) and one salon (static name). No Playwright.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Chain multi-location / shared workers (Phase 2)
- Receptionist or manager roles (Phase 2)
- Public “Register salon”
- Customer-facing salon picker for owners
- Owner hours / services / workers settings screens (STORY-01–03 were backend; no `/owner/settings`)
- QR reconnect / QR owner UI (STORY-34)
- Push payload `salonId` deep-link (STORY-31)
- In-flight chat tab (STORY-26)
- `localStorage` last-used salon; GraphQL “active salon” field or mutation
- Playwright, Pest, codegen, `vite-plugin-pwa`
- Native apps, payments, worker logins
