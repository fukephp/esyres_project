# Story map: STORY-37

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-37 |
| Source | `docs/stories/STORY-37.md` |
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-37.md` (after compile) |

## Destination

Owner of the selected salon sees how many people scanned that salon’s QR sticker and how many of those scans became verified visits (QR reconnect). No badge display. Customer UI never shows these numbers.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 05, 06, 07), `docs/architecture/` (03, 04, 05, 06, 08 #10 #22 #25), `docs/adr/0019-qr-sticker-is-not-salon-profile.md`, `docs/adr/0020-qr-reconnect-requires-timestamps.md`, `docs/stories/STORY-37.md` plus STORY-34 / 36 / 04, `docs/glossary.md` (**QR hold**, **QR reconnect**, **QR visit**, **Favorite**)
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): STORY-34 shipped. `GET /qr/{salonId}` sets `esyres_qr` (or reconciles immediately if both timestamps) and 302s to `/salon/{id}`. Organic `/salon/:id` does not set the cookie. `qr_scans` is append-only `(user_id, salon_id)` **at reconnect only** — one row per successful QR visit, not an anonymous hit. `qrScans(salonId, limit, offset)` is owner `OwnerAccess` + `ListPage` (default 20, max 50), newest first. No totals. No `/owner/stats`. `OwnerNav` is queue + chats. `/owner` home is queue + panel. SPA has no QR/stats chrome. STORY-34 key/map explicitly left **anonymous scan-hit counter** and **conversion stats UI** to this story.
- Story AC: scan count + converted-visit count (reconcile at verification) for the selected salon; use STORY-34 capture; no badge display.
- Tension: if this PR only reads `qr_scans`, scan count = converted count (always 100%). STORY-37 AC and `docs/mvp/05` want scan → verified-visit conversion. Cookie hold is not a countable history (last salon wins, ~7 day TTL, never persisted).
- Epic 9 / `docs/mvp/03`: QR stats live on the owner **Basic Stats** screen. STORY-36 out-of-scopes QR conversion and is unbuilt.
- Standing preferences:
  - One story → one PR; do not reopen STORY-34 cookie / favorite / visited meaning
  - Do not count organic `/salon/:id` or IG-bio hits as scans (ADR 0019)
  - Do not show stats on the customer surface
  - Do not ship trust-badge UI
  - Do not paginate `qrScans` in the client to fake a total (cap 50)
  - Behat GraphQL-over-HTTP + Vitest; no Playwright, Pest, codegen this PR
  - `/owner` home stays queue + panel

## Decisions so far

- STORY-37 is **owner QR conversion stats** only. Not STORY-36 bookings/busy/cancel. Not trust-badge display. Not customer-facing scan stats. Not marketing attribution beyond this QR. Not Customer History chrome. Not Favorites list UI.
- Selected salon only. Switcher `?salon=` must not mix numbers (STORY-04).
- **QR visit** (glossary) = existing `qr_scans` row (physical scan then both verification timestamps). Not a completed booking. Not `hasVerified*` local skip.
- Physical scan URL stays `GET /qr/{salonId}` (ADR 0019). This PR does not add a second sticker.
- Existing `qrScans` list stays the visit log. Stats need an aggregate (or equivalent) — the list cannot be the total.
- Stack: Lighthouse `/graphql`, Sanctum cookies, `OwnerAccess`, Behat, Vitest/typecheck/build. Bosnian-first. Design 2 owner dense.
- No Pest, Playwright, GraphQL codegen, `vite-plugin-pwa` this PR.

## Open decisions

- **Anonymous hit counter:** STORY-34 deferred it here. (A) Persist each successful `GET /qr/{existing}` as a scan hit; converted = `qr_scans` count for that salon. (B) Do not persist hits; both owner numbers are `COUNT(qr_scans)` (conversion always 100%). (C) Something else (e.g. unique customers).
- **Owner surface:** New `/owner/stats` with a QR block only (STORY-36 fills the rest later); a QR block on `/owner` home; or wait for STORY-36.
- **Window and rate:** All-time vs rolling week/month; two counts only vs also a percent.

## Not yet specified

- Hit uniqueness (every `GET /qr` vs one hit per cookie/salon) — only if anonymous hits are in
- GraphQL field names / type shape
- Bosnian copy for the numbers (and rate, if shown)
- Zero-scan empty copy vs literal `0`

## Out of scope

- Trust badge UI (Phase 2)
- Marketing attribution beyond this QR
- Customer-facing scan stats
- STORY-36 bookings per week / busiest hours / cancellation rate / day-level busy %
- Customer History visited-marker chrome
- Favorites list / manual heart
- A second “reconnect” QR product
- Counting organic `/salon/:id` or IG-bio as a scan (ADR 0019)
- Request→confirmed conversion
- Revenue
- Playwright, Pest, codegen, `vite-plugin-pwa`
