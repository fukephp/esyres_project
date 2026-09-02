# Answer key: STORY-21

> Epic 10 first slice: scripted salon-profile chat alternate that sends the same `createBooking` as the picker.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-21.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-21 |
| Source | `docs/stories/STORY-21.md` — Assistant chat on profile |
| Goal (one sentence) | On `/salon/:id`, `Pošalji zahtjev` stays primary; `Nisi sigurna? Pitaj salon.` expands a same-page scripted intake that completes via existing `createBooking` (`requested`), with no slot grid and no held cell. |
| Branch name | `story/STORY-21-assistant-chat` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-02 |

## Pass/fail — product

- [ ] Helper: zero services → hide chat CTA; one or more services → show — verify: Vitest
- [ ] Helper: zero workers → skip worker step (omit `workerId`); workers present → worker step with no-preference omit — verify: Vitest
- [ ] Helper: `canSend` / booking input only when ≥1 service + preferred date + preferred time (`HH:mm`); output matches picker `CreateBookingInput` (`salonId`, `serviceIds`, optional `workerId`, `preferredDate`, `preferredTime`); no slot list — verify: Vitest
- [ ] Helper: profile mode is `picker` or `chat`, not both — verify: Vitest
- [ ] Existing GraphQL `createBooking` still behaves as today (no origin field, no new mutation) — verify: Behat
- [ ] Profile happy path looks right on desktop and mobile: primary `Pošalji zahtjev`; alternate `Nisi sigurna? Pitaj salon.` when services exist; chat expanded (salon-voice prompts + chips, picker collapsed, native date then time `step` 15 min, no slot grid, no free-text) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #35.

- [ ] Lighthouse `/graphql` only; same `createBooking` / `CreateBookingInput`; no origin/source field; no Conversation table; no second booking mutation; no REST chat API — verify: schema + migrations unchanged for bookings origin/conversations; Behat hits `/graphql`
- [ ] Chat is not a new route; stays on `/salon/:id`; `requested` still does not occupy a clock slot — verify: frontend routes; Behat occupancy unchanged
- [ ] No LLM vendor, no Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require
- [ ] Sanctum cookies unchanged; chat send reuses picker gate panels on `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`; no magic token — verify: no new auth bypass; Behat login steps still the gate

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- 1–3 preferred-time suggestions (STORY-22)
- Salon-branded Q&A from live data beyond intake prompts (STORY-23)
- Chat-specific send-gate polish / already-verified one-confirm copy (STORY-24)
- Assistant-origin tag and collapsed transcript on Request Detail (STORY-25)
- Owner in-flight chat tab + badge (STORY-26)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Customer inbox, new route, bottom sheet, Conversation table
- Changing picker behavior, busy-level thresholds, or `createBooking` gates
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/stories/STORY-21.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/STORY-21-assistant-chat`.
3. **No backend schema this PR.** Do not add origin, transcript, or conversations. Do not change `createBooking`.
4. **PWA `/salon/:id`:** keep `Pošalji zahtjev` as the primary filled button. When `salon.services.length > 0` and not sent, show alternate text-style control `Nisi sigurna? Pitaj salon.` under it (empty catalog: hide both). Modes: idle / picker / chat / sent — picker and chat never both open; opening one collapses the other; drafts not shared. No new route, no sheet.
5. **Scripted intake (chat mode):** salon-voice Bosnian prompt lines from `i18n.ts` (no bot name). Taps only — no free-text. Steps: multi-select service chips → worker chips if workers exist (Nema preference default; omit `workerId`) else skip → native date → native time `step={900}` → send. Past answers stay visible in the expand. No busy-level on the chosen day. No 1–3 suggestions. No slot grid. Same `CREATE_BOOKING_MUTATION` and picker `send` / gate panels (`AuthShell`, `EmailVerifyPanel`, `PhoneOtpPanel`). Already-verified: one send. Success: same-page `salon.success`.
6. **Vitest:** extract a small helper (e.g. `frontend/src/lib/assistant.ts`) covering every Vitest product check. Keep existing booking tests passing.
7. **Behat:** no new feature required. Full `vendor/bin/behat` must stay green.
8. Optional one-line on `docs/architecture/04-Frontend.md` UX: chat is a same-page expand on `/salon/:id`, mutually exclusive with the picker; this slice uses native date+time (suggestions remain STORY-22). Do not rewrite decision 35.
9. Do not add Pest, Playwright, codegen, Redis, owner chat tab, or LLM.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of the profile with both CTAs and chat expanded (prompts + chips, picker collapsed, native date/time, no slot grid) in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
