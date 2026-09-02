# Story map: STORY-21

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-21 |
| Source | `docs/stories/STORY-21.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-21.md` |

## Destination

On `/salon/:id`, `Pošalji zahtjev` stays the primary CTA. A visible alternate `Nisi sigurna? Pitaj salon.` opens a scripted intake on that profile. Completing it calls the same `createBooking` and creates `requested`. No live slot grid, no held clock cell.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 08), `docs/stories/STORY-21.md` plus STORY-22–28 for slice walls, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): guest `/salon/:id` picker (`Pošalji zahtjev` → multi-select + worker radios + native date/time → `createBooking`). Gates: `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` inline (`AuthShell`, `EmailVerifyPanel`, `PhoneOtpPanel`). `CreateBookingInput` has no origin. No Conversation / transcript tables. No Playwright. Vitest covers lib helpers only. Public `salon` has name, hours, services, workers, `busyLevel` — no address/photos.
- Sibling walls (do not absorb): STORY-22 time suggestions; STORY-23 salon voice + live Q&A; STORY-24 chat send-gate UX; STORY-25 origin tag + transcript on Request Detail; STORY-26 owner in-flight tab; STORY-27 Take over; STORY-28 unknown/ping.
- Standing preferences:
  - Do not invent a second API (not REST, not a chat microservice)
  - Do not add an LLM, WhatsApp/Viber/IG DM, or a customer inbox
  - Do not expand `createBooking` status machine
  - Picker remains the fast path; chat is the messy-intent alternate on the same profile

## Decisions so far

- STORY-21 only: guest alternate on the salon profile. Not owner tab, not take-over, not 1–3 time suggestions, not unknown/ping.
- Picker CTA copy stays `Pošalji zahtjev`. Chat entry copy is `Nisi sigurna? Pitaj salon.`
- Chat is in-PWA scripted intake on `/salon/:id` — not a customer inbox, not WhatsApp, not a named platform bot.
- Completing intake creates the same `requested` booking via existing `createBooking` (`CreateBookingInput`: salonId, serviceIds, optional workerId, preferredDate, preferredTime). `requested` still does not occupy a clock slot.
- No live slot grid and no held clock cell in chat (same coarse-signal rule as the picker).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, Vitest/typecheck/build. Assistant v1 adds no stack component (architecture decision 35).
- Bosnian-first i18n (`bs`, no language switcher). Design 2 customer sparse.
- LLM / free-form NLU and Viber/WhatsApp/Instagram DM are Phase 2.
- **Day/time this PR (2026-09-02):** after service + worker, two scripted steps — native **date**, then native **time** (`step` 15 min), same `preferredDate` / `preferredTime` as the picker. No 1–3 suggestions (STORY-22). No slot grid, no held cell.
- **Input this PR (2026-09-02):** tappable chips and native controls only. No free-text box. Not NLU; unknown/ping is STORY-28; live Q&A is STORY-23.
- **Services (2026-09-02):** same multi-select as the picker (`serviceIds`). Tappable chips; one service is one chip.
- **Chrome (2026-09-02):** same `/salon/:id`. Alternate link expands the intake under it. No new route. No bottom sheet this PR.
- **Picker vs chat (2026-09-02):** mutually exclusive. Opening chat collapses the picker; `Pošalji zahtjev` collapses chat. Drafts not shared.
- **Persistence (2026-09-02):** client-only React state until send succeeds. Refresh loses the thread. No Conversation table this PR (STORY-26).
- **Origin (2026-09-02):** untagged `createBooking`. No source/origin field. Tag + transcript are STORY-25.
- **Send gates (2026-09-02):** reuse picker panels on the same mutation errors (`UNAUTHENTICATED` → `AuthShell`, `EMAIL_UNVERIFIED` → email panel, `PHONE_UNVERIFIED` → OTP). Already-verified: one send at the last step. No chat-specific gate copy. STORY-24 still owns “cannot skip” coverage and one-confirm polish.
- **Prompt copy (2026-09-02):** hardcoded Bosnian strings in `i18n.ts`, same as the rest of the PWA. Not a CMS. Address/photos stay off public `salon` (STORY-23 live-data, not this PR).
- **Empty catalog (2026-09-02):** hide `Nisi sigurna? Pitaj salon.` when there are no services (same as hiding `Pošalji zahtjev`).
- **No workers (2026-09-02):** skip the worker step; omit `workerId` (no preference). Same as the picker hiding the worker fieldset.
- **Success copy (2026-09-02):** same-page picker string (`Zahtjev je poslan. Salon će odgovoriti.`). No dedicated confirmation route.
- **Busy on the day step (2026-09-02):** skip. Header already shows today. Chosen-day `busyLevel(date:)` is STORY-22.
- **Conversation shape (2026-09-02, from mvp 04):** short salon-voice Bosnian prompt lines + current-step chips/native controls. Past answers stay visible in the expand. No named bot. Not a numbered form and not a WhatsApp thread.
- **Verifiers (2026-09-02):** Vitest step helper (CTA visibility, skip worker, canSend/input, mutually exclusive modes). Behat existing suite (regression; no new GraphQL). One human-only: PR screenshots desktop+mobile. No Playwright this PR.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- 1–3 preferred-time suggestions (STORY-22)
- Salon-branded Q&A from live data beyond what this intake needs to send (STORY-23)
- Chat-specific send-gate polish / already-verified one-confirm copy (STORY-24); this PR only reuses picker panels so send can succeed
- Assistant-origin tag and collapsed transcript on Request Detail (STORY-25)
- Owner in-flight chat tab + badge (STORY-26)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Customer inbox or a second booking mutation
- New GraphQL stack piece, Playwright, Pest, codegen, `vite-plugin-pwa`
- Changing picker behavior, busy-level thresholds, or `createBooking` gates
