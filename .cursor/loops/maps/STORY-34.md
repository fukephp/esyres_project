# Story map: STORY-34

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-34 |
| Source | `docs/stories/STORY-34.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-34.md` |

## Destination

Scanning the existing salon QR sets a ~7 day guest hold cookie (last salon wins, no second sticker, no popup). When the guest is email+phone verified, reconcile: favorite that salon, mark QR-visited for the owner, store a `qr_scans` row, clear the cookie. Guest `/salon/:id` browse stays without a login wall. No badge UI and no QR conversion stats screen.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03 QR Reconnect Loop, 06 Epic 8, 08 QR hold decided), `docs/architecture/` (03 Epic 8, 05 `QrScan`, 06 QR hold, 08 #10 #25), `docs/stories/STORY-34.md` plus STORY-07 / 11 / 12 / 35 / 37 / 38, `docs/glossary.md` (QR hold / QR reconnect / Favorite / QR visit), `docs/adr/0019-qr-sticker-is-not-salon-profile.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): no `esyres_qr` cookie, no `qr_scans` / favorites / visited tables or GraphQL. Guest `/salon/:id` is public (`salon_profile.feature`). Email verify is signed GET `verification.verify` (no session required, does not log in). Phone OTP is sessioned `verifyPhoneOtp`. Cookie httpOnly ⇒ SPA cannot set it; Behat already copies `Set-Cookie` from HTTP responses. Laravel `routes/web.php` has only `/` welcome + `verification.verify`. No owner Customer History route. No customer Favorites route. STORY-07 treated `/salon/:id` as the QR/IG destination but left the hold cookie to this story.
- Backend rule: “QR scan after verify silently favorites the salon and marks owner customer history as visited.”
- Verify runner exists (`esyres_app/` Behat + Vite typecheck/test/build). Domain trigger list is empty.
- Standing preferences:
  - Do not add a second QR sticker product
  - Do not popup or toast on scan or reconcile
  - Do not put a login wall on guest browse
  - Do not ship badge display (Phase 2) or QR conversion stats UI (STORY-37)
  - Do not add Pest, Playwright, GraphQL codegen, redis/nginx/mailpit/worker this PR
  - Scan row is at reconcile (architecture 05: guest hold is a cookie until reconcile), not an anonymous hit counter this PR

## Decisions so far

- Cookie name `esyres_qr`, ~7 days, httpOnly, SameSite=Lax, payload last scanned `salonId` (plain id string), last scan wins (`docs/architecture/06-Auth-Notifications-Realtime.md`, 08 #25).
- Reconcile effects: favorite that salon + owner visited marker + `qr_scans` row + clear cookie (`docs/stories/STORY-34.md`, architecture 06).
- No second sticker, no popup (`docs/mvp/03-Key-Features.md`).
- Guest browse from QR still has no login wall (story AC; architecture 04).
- Trust badge **display** is Phase 2 (story OOS; STORY-35).
- QR scan conversion stats UI is STORY-37 (story OOS).
- Anonymous scan counting for conversion stats is not this PR (cookie until reconcile).
- Owner QR image / print UI is not this PR (STORY-38 OOS “Photos, QR, push”; no second QR product).
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP (+ cookie GET), Vitest/typecheck/build. Bosnian-first. Design 2. No Pest / Playwright / codegen this PR.
- **Sticker URL (2026-09-10):** `GET /qr/{salonId}` sets the cookie and 302s to `/salon/{id}`. Organic `/salon/:id` and IG bio do not set the cookie. Missing salon → 302 `/`, no cookie. ADR 0019.
- **Reconcile hooks (2026-09-10):** when a **session** user has both email+phone verification **and** the cookie: (1) QR GET if already both-verified, (2) `verifyPhoneOtp` if email already verified, (3) signed email GET only if that user is the session user and phone already verified, (4) `login` after a guest scan. No-session email GET does not reconcile (cookie stays). Register does not (timestamps still null).
- **Owner see (2026-09-10):** data + GraphQL only. No Customer History screen. Owner of that salon can query scan/visited rows. Behat asserts GraphQL.
- **Favorites (2026-09-10):** silent auto-favorite on reconcile only. `me` can read favorite ids. No heart, no `/favorites` list.
- **Persistence (2026-09-10):** `favorites` unique `(user_id, salon_id)` + timestamps. `qr_scans` event rows `(user_id, salon_id, timestamps)`. QR visit = at least one `qr_scans` row for that pair. No `visited_at` column.
- **Repeat (2026-09-10):** each reconcile appends a `qr_scans` row. Favorite is `firstOrCreate` (no duplicate bookmark).
- **GraphQL (2026-09-10):** `me.favoriteSalonIds: [ID!]!` (empty if none). `qrScans(salonId, limit=20, offset=0): [QrScan!]!` newest first — `id`, `salonId`, `customerId`, `createdAt`. `ListPage` cap. `OwnerAccess` (guest `UNAUTHENTICATED`, not-your-salon / missing salon `FORBIDDEN`).
- **Verified (2026-09-10):** reconcile only if both `email_verified_at` and `phone_verified_at` are non-null. Do not use `hasVerifiedEmail/Phone()` (local skip must not fake visits). ADR 0020.
- **Stale cookie:** missing/invalid salon id → forget cookie, write nothing.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Trust badge display (Phase 2 / STORY-35)
- QR scan conversion stats UI (STORY-37)
- A second “reconnect” QR product
- Anonymous scan-hit counter (STORY-37 may add later)
- Owner QR artwork / download / print
- Customer Favorites list UI / manual heart
- Owner Customer History screen
- No-show / cancel counters / `owner_responded_at` (STORY-35)
- Playwright, Pest, GraphQL codegen
- Redis, nginx, mailpit, queue worker containers
