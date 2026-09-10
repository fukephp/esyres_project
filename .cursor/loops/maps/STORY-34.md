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
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-34.md` (after compile) |

## Destination

Scanning the existing salon QR sets a ~7 day guest hold cookie (last salon wins, no second sticker, no popup). When the guest is email+phone verified, reconcile: favorite that salon, mark QR-visited for the owner, store a `qr_scans` row, clear the cookie. Guest `/salon/:id` browse stays without a login wall. No badge UI and no QR conversion stats screen.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03 QR Reconnect Loop, 06 Epic 8, 08 QR hold decided), `docs/architecture/` (03 Epic 8, 05 `QrScan`, 06 QR hold, 08 #10 #25), `docs/stories/STORY-34.md` plus STORY-07 / 11 / 12 / 35 / 37 / 38, `docs/glossary.md` (no QR/Favorites/visited terms yet)
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

- Cookie name `esyres_qr`, ~7 days, httpOnly, SameSite=Lax, payload last scanned `salonId`, last scan wins (`docs/architecture/06-Auth-Notifications-Realtime.md`, 08 #25).
- Reconcile effects: favorite that salon + owner visited marker + `qr_scans` row + clear cookie (`docs/stories/STORY-34.md`, architecture 06).
- No second sticker, no popup (`docs/mvp/03-Key-Features.md`).
- Guest browse from QR still has no login wall (story AC; architecture 04).
- Trust badge **display** is Phase 2 (story OOS; STORY-35).
- QR scan conversion stats UI is STORY-37 (story OOS).
- Anonymous scan counting for conversion stats is not this PR (cookie until reconcile).
- Owner QR image / print UI is not this PR (STORY-38 OOS “Photos, QR, push”; no second QR product).
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP (+ cookie GET), Vitest/typecheck/build. Bosnian-first. Design 2. No Pest / Playwright / codegen this PR.

## Open decisions

- **Sticker URL:** How does a physical QR scan set `esyres_qr` without treating Instagram-bio / organic `/salon/:id` as a visit? (httpOnly ⇒ Laravel GET, not SPA JS.)
- **Already-verified reconnect:** Architecture says reconcile at email+phone verification. The user story is a *returning* customer who may already be verified. When does a later scan still favorite + visit + scan-row?
- **Owner “see” this PR:** No Customer History screen exists. Is visited a persisted GraphQL fact the owner of that salon can query, or new owner chrome?
- **Favorites this PR:** Silent auto-favorite only, or also a customer Favorites list / manual heart?

## Not yet specified

- Exact `favorites` / `qr_scans` / visited columns (graduates after owner-see + favorites surface lock).
- Unknown or missing salon on the QR GET (graduates after sticker URL locks).
- Which code paths call reconcile besides “at verification” (email GET with/without session, `verifyPhoneOtp`, login after a guest scan) — hangs off already-verified reconnect.

## Out of scope

- Trust badge display (Phase 2 / STORY-35)
- QR scan conversion stats UI (STORY-37)
- A second “reconnect” QR product
- Anonymous scan-hit counter (STORY-37 may add later)
- Owner QR artwork / download / print
- Customer Favorites list UI unless this map locks it in
- Owner Customer History screen unless this map locks it in
- No-show / cancel counters / `owner_responded_at` (STORY-35)
- Playwright, Pest, GraphQL codegen
- Redis, nginx, mailpit, queue worker containers
