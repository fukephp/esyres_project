# Answer key: STORY-24

> Epic 10 slice: chat send cannot skip picker gates; already-verified confirm once.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-24.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-24 |
| Source | `docs/stories/STORY-24.md` — Assistant send gates |
| Goal (one sentence) | Chat `createBooking` on `/salon/:id` still requires login + verified email + phone OTP (including with `intakeToken`); already-verified guests get one submit at the end, unverified guests the same picker panels. |
| Branch name | `story/STORY-24-assistant-send-gates` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [x] Helper: all flags false → `submit`; only `needLogin` → `login`; only `needEmail` → `email`; only `needPhone` → `phone` — verify: Vitest
- [x] Helper: if more than one flag is true, return exactly one surface (priority `login` > `email` > `phone`) — verify: Vitest
- [x] Guest `createBooking` with a valid in-flight `intakeToken` → `UNAUTHENTICATED`; intake still readable — verify: Behat (`features/guest/assistant_intake.feature`)
- [x] Session + unverified email + valid in-flight `intakeToken` → `EMAIL_UNVERIFIED`; intake still readable — verify: Behat
- [x] Session + unverified phone + valid in-flight `intakeToken` → `PHONE_UNVERIFIED`; intake still readable — verify: Behat
- [x] Verified customer + valid in-flight `intakeToken` still creates `REQUESTED` and drops the intake — verify: Behat (existing scenario stays green)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #5 #6 #35. ADRs 0002, 0013.

- [x] Same `createBooking` / `CreateBookingInput`; `intakeToken` does not skip session / email / phone; no new mutation; picker gates unchanged — verify: schema unchanged for a chat-only send; Behat existing `create_booking.feature` still passes
- [x] Chat stays on `/salon/:id`; reuses `AuthShell` / `EmailVerifyPanel` / `PhoneOtpPanel` (picker copy); no `me` preflight; `afterAuth` still retries `createBooking` — verify: `AssistantIntake` / `SalonProfile`; no new gate components or i18n gate keys
- [x] `APP_ENV=local` skip stays `User::hasVerifiedEmail/Phone` only (ADR 0013); no Vite/`DEV` skip — verify: no `import.meta.env` gate bypass in frontend send; Behat `testing` scenarios above still fail closed
- [x] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Weakening picker gates
- OTP as login
- Owner-side send
- `me` preflight before the first send
- Extra recap step or second confirm after OTP
- Salon-voice wrappers around gate panels
- Changing `createBooking` status machine, busy-level thresholds, or suggestion math (STORY-22)
- Assistant-origin tag and transcript (STORY-25)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU; Viber / WhatsApp / Instagram DM (Phase 2)
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Salon Booking Assistant**, **scripted intake**), `docs/stories/STORY-24.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `docs/adr/0013-local-skip-verification-gates.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/STORY-24-assistant-send-gates`.
3. **No new GraphQL and no gate-order change.** Do not weaken `createBooking`. Do not add a chat-only send mutation. Do not attach `intakeToken` from the picker. Do not add a Vite/`import.meta.env` verification skip.
4. **Helper** in `frontend/src/lib/assistant.ts`: `assistantSendChrome({ needLogin, needEmail, needPhone })` → `'submit' | 'login' | 'email' | 'phone'`. Priority if multiple flags: login, then email, then phone. All false → `submit` (already-verified one confirm). Keep existing `assistantCanSend` / `assistantBookingInput`.
5. **PWA chat (`AssistantIntake`):** drive submit vs panels from that helper. Keep `assistant.send` + `salon.submit`. Keep `AuthShell` / `EmailVerifyPanel` / `PhoneOtpPanel` and their picker strings. First send still calls `createBooking`; map `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` to exclusive flags as today; `afterAuth` still upserts (if chatting) then retries send. No recap step. No `me` preflight. Picker chrome stays as-is.
6. **Behat:** extend `features/guest/assistant_intake.feature` — guest + token → `UNAUTHENTICATED` and intake still readable; logged-in unverified email + token → `EMAIL_UNVERIFIED` and intake still readable; logged-in unverified phone + token → `PHONE_UNVERIFIED`; intake still readable. Keep “Valid intake token on createBooking drops the row”. Reuse existing Givens (`unverified customer`, `whose phone is not verified`) and intake steps. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green.
7. **Vitest:** cover every Vitest product check. Keep STORY-21/22/23 assistant tests green.
8. Patch one line on `docs/architecture/04-Frontend.md` UX: chat on `/salon/:id` uses the same `createBooking` gate panels as the picker (`UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`); already-verified is one submit. Do not rewrite decision 35 or ADR 0013.
9. Do not add Pest, Playwright, codegen, Redis, origin/transcript, Take over, or LLM.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
