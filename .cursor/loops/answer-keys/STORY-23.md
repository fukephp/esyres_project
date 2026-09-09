# Answer key: STORY-23

> Epic 10 slice: salon-profile chat speaks as this salon in Bosnian and only uses live salon data (no invented policy).
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-23.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-23 |
| Source | `docs/stories/STORY-23.md` — Assistant salon voice and live data |
| Goal (one sentence) | Chat on `/salon/:id` opens as `{name} ovdje.`, prints live address when set, shows duration+KM on service chips and chosen-day hours from that salon’s GraphQL data, and never invents cancel policy, prices, or hours. |
| Branch name | `story/STORY-23-assistant-salon-voice` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-09 |

## Pass/fail — product

- [ ] Helper: opening name is the live salon name; output does not contain Cora, Esyres, or a bot name — verify: Vitest
- [ ] Helper: `address` null / blank / whitespace → no address line; non-empty → exact trimmed live string; never `lat`/`lng` — verify: Vitest
- [ ] Helper: missing day → no hours facts; closed day → closed, no invented clocks; open day → live `opensAt`/`closesAt` and break when present — verify: Vitest
- [ ] Helper: service chip parts are live `name`, `durationMinutes`, and `priceFeninga` (not hardcoded KM or duration) — verify: Vitest
- [ ] Helper / query shape: voice helpers do not take or return `cancellationNoticeHours`; public salon query does not request that field — verify: Vitest + `PUBLIC_SALON_QUERY` in `esyres_app/frontend/src/graphql/salon.ts`
- [ ] Guest public `salon` includes `address` (null by default; guest reads the stored string when set); guest still cannot read `cancellationNoticeHours` — verify: Behat (`features/guest/salon_profile.feature`)
- [ ] Existing `createBooking` unchanged (no origin; `requested` does not occupy) — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #15 #20 #35.

- [ ] `Salon.address` is a nullable public GraphQL `String` (migration + model); `cancellationNoticeHours` stays owner-only; no `updateSalon` address mutation this PR — verify: `esyres_app/graphql/schema.graphql`; Behat guest owner-fields still `UNAUTHENTICATED`
- [ ] Same `createBooking` / `CreateBookingInput`; no Conversation table; no REST/knowledge API; no LLM vendor — verify: schema + migrations; `esyres_app/frontend/package.json`; no `pestphp` require
- [ ] Chat stays on `/salon/:id`; no free-text; no topic-chip row; no profile-page address block; no maps/geocode — verify: `AssistantIntake` / `SalonProfile`; frontend routes
- [ ] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- Unknown → say so / ping owner (STORY-28)
- LLM paraphrasing outside live data (Phase 2)
- English language switcher
- Topic-chip / FAQ ask row
- Chat-specific send-gate polish (STORY-24)
- Assistant-origin tag and transcript (STORY-25)
- Owner in-flight chat tab (STORY-26)
- Take over / after hours / DND (STORY-27)
- Owner editor for address; address block on the salon profile page
- Photos, maps SDK, geocode UI, maps link-out
- Exposing `cancellationNoticeHours` to guests
- Changing picker native date+time, busy-level thresholds, or `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Salon Booking Assistant**, **scripted intake**), `docs/stories/STORY-23.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/STORY-23-assistant-salon-voice`.
3. **Backend:** nullable `salons.address` (string) + public GraphQL `Salon.address: String`. Factory default `null`. Fillable. No owner mutation, no geocode, do not copy `lat`/`lng` into address. Do not change `createBooking` or `cancellationNoticeHours` auth.
4. **Helpers** in `frontend/src/lib/assistant.ts` (or a sibling): `assistantHelloName(name)` → live name; `assistantAddressLine(address)` → trimmed string or `null`; `assistantHoursFacts(day)` → `null` / `{ closed: true }` / `{ closed: false, opensAt, closesAt, breakStartsAt, breakEndsAt }` from that day’s hours only; chip parts pass through live service `name` / `durationMinutes` / `priceFeninga`. Do not accept `cancellationNoticeHours`. Keep STORY-21/22 helpers green.
5. **PWA chat only (`AssistantIntake`):** first line `t('assistant.hello', { name })` with i18n `{{name}} ovdje.`; then address line if helper returns a string (raw live text). Service chips: name + `t('salon.duration', { n })` + `formatFeninga`. After a chat date is set, show chosen-day hours using the same labels as the profile hours line (`salon.closed` / `opens–closes` / `salon.break`) next to existing busy / `SALON_CLOSED`. Workers stay live name chips. No free-text, no FAQ topic chips, no cancel-policy copy. Picker native date+time unchanged. Do **not** add an address block on the profile page.
6. **Query:** add `address` to `PUBLIC_SALON_QUERY`. Do not request `cancellationNoticeHours`. Do not query `occupyingBookings` from guest profile.
7. **i18n:** Bosnian in `i18n.ts`; new `assistant.hello` only if needed; reuse `salon.duration`, `salon.closed`, `salon.break`. No bot name. No English keys.
8. **Behat:** extend `features/guest/salon_profile.feature` — guest reads `address` null by default; guest reads a set street string. Keep “Guest cannot read cancellation notice hours”. Add a Given if needed. Full `vendor/bin/behat` must stay green.
9. **Vitest:** cover every Vitest product check. Keep STORY-21/22 assistant tests green.
10. Patch one line on `docs/architecture/04-Frontend.md` UX: chat opening interpolates salon name, optional live address, duration+KM on chips, chosen-day hours on the date step. Do not rewrite decision 35.
11. Do not add Pest, Playwright, codegen, Redis, owner chat tab, or LLM.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
