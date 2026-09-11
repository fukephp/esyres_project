# Story map: STORY-41

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-41 |
| Source | `docs/stories/STORY-41.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-41.md` |

## Destination

A customer creates a salon on the same account from guest-reachable `/create-salon` (AuthShell → email-verify if needed → name), lands on `/owner`, and discovery lists only **listed** salons. No waitlist, no second owner account type, no second salon from this path.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-41.md` (deps STORY-01, STORY-11, STORY-40), `docs/stories/STORY-40.md`, `docs/adr/0025-self-serve-create-salon.md`, `docs/adr/0028-listed-salon-on-discovery.md`, `docs/glossary.md` (**Create salon**, **Listed salon**, **Owner**, **Homepage**, **Discovery home**), `docs/architecture/` (03 Epic 7, 04 `/create-salon`, 05 Salon, 06 Owner onboarding, 08 #7 #43), `DESIGN.md` / `refs/design-1/DESIGN.md`
- Skills: grill-with-docs subroutine (app code exists; no diverge); custom-feature-skills; playbook plan-gate until this map compiles
- **STORY-40 is not in the app.** `/` is still `HomeGate` + `esyres.companyPitchSeen` then `DiscoveryHome` on the same URL. No `/salons`, no homepage header, no Get your panel slot. Catch-all `*` → `/`.
- Code today (`esyres_app/`):
  - No `/create-salon` route, no `createSalon` mutation, no Formspree/waitlist/`/signup`
  - Salons created only by factory / Behat fixtures / `LocalDemoSeeder`. `salons.owner_id` + `User::salons()` hasMany (multi-own already). Boot/factory defaults: closed week, `cancellation_notice_hours` 24, `dnd` false, `reschedule_cap` 1, `address`/`lat`/`lng` null, empty services/workers
  - `/owner` logged-out → `AuthShell allowRegister={false}`; unverified → `EmailVerifyPanel`; no salon → `owner.notOwner` copy, no create CTA
  - `User::hasVerifiedEmail()` skips when `APP_ENV=local` (unchanged)
  - `salonsNearby` = coords only; `popularInSarajevo` = every salon. No listed gate. `salon(id)` still returns empty/closed shops
  - Hours JSON on `salons.hours`; open weekday = a day with `closed: false` (writer also requires `opens_at`/`closes_at`)
  - Service/Worker empty name → `INVALID_NAME`. Owner mutations: `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` via `OwnerAccess::user`
  - Behat `features/guest/salon_discovery.feature` expects Popular to include `"Hidden"` (no coords, factory-closed, no services). Listed filter will empty current Nearby/Popular fixtures unless scenarios add one open weekday + one service
- Standing preferences:
  - One story → one PR. Do not implement STORY-40 homepage IA or STORY-42 Design-2 delete
  - No waitlist, Formspree, `/signup`, second owner user type
  - No geocoding, no address/`lat`/`lng` editor
  - Behat GraphQL-over-HTTP; Vitest helpers; no Playwright, Pest, codegen this PR
  - Bosnian i18n `bs`, informal *ti*

## Decisions so far

- **Route (story + ADR 0025):** `/create-salon` is a registered React route, guest-reachable, not `/signup`, not under `/owner`. Catch-all must not swallow it.
- **Page IA (story + ADR 0025):** Sparse Design-1: brand link to `/`, no homepage header/footer, no feature grid, no owner-panel chrome. Logged out → existing `AuthShell` (`allowRegister` true — this is the customer-who-has-a-salon path). Unverified → existing `EmailVerifyPanel`. Then one name field. Success → `/owner`.
- **Mutation (story + architecture 03/05):** `createSalon(name: String!): Salon!`. Same `users` row (`owner_id` = session). Defaults = today’s provisioned salon (closed week, cancel 24h, empty catalog, no address/coords). Local email skip unchanged (`hasVerifiedEmail`). Unauthenticated → `UNAUTHENTICATED`; unverified (non-local) → `EMAIL_UNVERIFIED`. Empty/whitespace name → trim then `INVALID_NAME` (same as Service/Worker).
- **Already owns (story):** `/create-salon` redirects to `/owner` when `me.salons.length > 0`. Does not create another salon from this page.
- **Listed (story + ADR 0028):** Nearby and Popular omit until ≥1 weekday `closed: false` **and** ≥1 service row. Nearby still requires `lat`/`lng`. `salon(id)` / `/salon/:id` still resolve when unlisted. No geocoding this PR.
- **Discovery Behat:** scenarios that expect a salon in Nearby/Popular must fixture one open weekday + one service. Add coverage: closed+service omitted; open+no service omitted; open+service listed; unlisted still in `salon(id)`. `"Hidden"` stays off Nearby (no coords) and off Popular (unlisted).
- **Stack:** existing Lighthouse `/graphql`, Sanctum cookies, i18next `bs`, Vitest helpers. No Pest, Playwright, codegen, REST, sibling marketing site.
- **OOS stays OOS:** second salon from homepage (STORY-04), address editor, hours/services/workers UI (STORY-01–03), Design-2 delete / owner light nav (STORY-42), public pricing, invite-email onboarding UI.
- **Homepage CTA (2026-09-11):** Option B. This PR does **not** build STORY-40 homepage IA. Cover already-owner vs not with helper `ownerPanelCta(ownsSalon)` → `{ href: '/owner', kind: 'panel' }` vs `{ href: '/create-salon', kind: 'create' }`. i18n `home.panel` = `Panel`. STORY-40 wires the header and drafts Get your panel copy. `/create-salon` is reachable by URL.
- **Second salon API (2026-09-11):** `createSalon` **allows** another row (multi-own stays). Only `/create-salon` UI redirects when `me.salons.length > 0`. No `ALREADY_OWNS`.
- **`/owner` empty (2026-09-11):** `OwnerHome` not-owner state keeps `owner.notOwner` and adds one link to `/create-salon`, copy `Napravi salon`. Not a form on `/owner`. Other owner routes keep the paragraph only.
- **Copy (2026-09-11):** i18n `bs`, informal *ti*. `pitch.brand` / create-salon brand `Esyres`; `createSalon.name` `Ime salona`; `createSalon.submit` `Otvori panel`; `createSalon.INVALID_NAME` `Unesi ime salona.`; `home.panel` `Panel`; `owner.createSalon` `Napravi salon`. Reuse AuthShell + EmailVerifyPanel copy.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Implementing STORY-40 homepage / `/salons` / persist-seen removal (unless the homepage-CTA decision explicitly pulls chrome in)
- Second salon from the homepage (salon switcher stays STORY-04)
- Owner address / `lat`/`lng` editor
- Hours, services, workers UI (STORY-01–03)
- Deleting Design-2 / owner light nav (STORY-42)
- Public pricing page
- Invite-email onboarding UI
- Waitlist, Formspree, `/signup`, second owner account type
- Geocoding
- Playwright, Pest, GraphQL codegen
