# Story map: STORY-24

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-24 |
| Source | `docs/stories/STORY-24.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-24.md` |

## Destination

Chat send on `/salon/:id` cannot skip login, verified email, or phone OTP. `createBooking` creates `requested` only when those gates pass. Already-verified guests confirm once at the end. Unverified guests complete the same email + OTP flow as the picker.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 03, 04, 06, 08), `docs/architecture/` (03, 04, 06, 08 #5 #6 #35), `docs/adr/0002`, `docs/adr/0013`, `docs/stories/STORY-24.md` plus STORY-11 / 12 / 21, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): chat and picker share `SalonProfile.send()` → same `createBooking`. Gates run before the booking transaction and before `attachIntake`. Error codes `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` swap submit for `AuthShell` / `EmailVerifyPanel` / `PhoneOtpPanel`. `afterAuth` upserts the intake (if chatting) then retries send. Already-verified: first send succeeds; no panels. Send-step copy is `assistant.send` + `salon.submit`. `APP_ENV=local` skips email/phone via `User::hasVerifiedEmail/Phone` (ADR 0013); Behat `testing` keeps the gates. No Playwright. Vitest covers lib helpers. Behat is GraphQL-over-HTTP.
- STORY-21 deferred here: “cannot skip” coverage and one-confirm polish. That PR only reused picker panels so send can succeed.
- Sibling walls: STORY-25 origin/transcript; STORY-26 owner tab (done); STORY-27 take-over; STORY-28 unknown/ping. Do not weaken picker gates (story out of scope).
- Standing preferences:
  - Do not invent a second API or a chat-only booking mutation
  - Do not weaken `createBooking` gates
  - Do not add OTP-as-login
  - Do not add owner-side send
  - Picker remains the fast path; chat stays the messy-intent alternate

## Decisions so far

- STORY-24 only: chat send gates + one-confirm. Not origin/transcript, not take-over, not unknown/ping.
- Same contract as the picker: Sanctum session + `email_verified_at` + `phone_verified_at` (architecture 08 #5–6, ADR 0002). Chat has no bypass.
- Same `createBooking` / `CreateBookingInput`. Optional `intakeToken` (STORY-26) does not skip gates; attach runs only after a successful create.
- Unverified guests use the same GraphQL as the picker: `register`/`login`, `resendVerificationEmail`, `requestPhoneOtp` / `verifyPhoneOtp`. No new verify mutations.
- `APP_ENV=local` skip stays backend-only (ADR 0013). No Vite/`import.meta.env.DEV` skip. Staging, production, and Behat `testing` keep the gates.
- OTP is not login. Owner does not send from chat.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. No LLM, no Playwright, no Pest, no codegen this PR.
- Bosnian-first (`bs`). Design 2 customer sparse. Chat stays on `/salon/:id`.
- Reuse existing `AuthShell`, `EmailVerifyPanel`, `PhoneOtpPanel` (same components as the picker). Do not add a second gate UI kit.
- **Trigger (2026-09-10):** first `Pošalji` calls `createBooking`. `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` swap submit for the matching panel. `afterAuth` retries the same mutation. No `me` preflight. Server remains source of truth (including ADR 0013).
- **Cannot-skip (2026-09-10):** Behat `createBooking` **with** a valid in-flight `intakeToken` for guest / unverified email / unverified phone → same error codes as the picker; no `REQUESTED` row; intake still readable (not converted). Keep existing no-token `create_booking.feature`. No Playwright.
- **One-confirm (2026-09-10):** exclusive chrome helper only. No flags → one submit (`assistant.send` + `salon.submit`). Login XOR email XOR phone (priority login > email > phone). No recap step. No extra tap after OTP. Past answers already stay visible.
- **Gate copy (2026-09-10):** picker panel strings unchanged. Chat voice stays `assistant.send`. No salon-voice wrappers around AuthShell / email / OTP.
- **Verifiers (2026-09-10):** Vitest on the chrome helper. Behat on `features/guest/assistant_intake.feature` for the three token-gate failures. Full Behat suite stays green. No human-only. UI ready = machine gates.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Weakening picker gates
- OTP as login
- Owner-side send
- Changing `createBooking` status machine, busy-level thresholds, or suggestion math (STORY-22)
- Assistant-origin tag and transcript (STORY-25)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Playwright, Pest, codegen, `vite-plugin-pwa`
