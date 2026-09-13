# Answer key: STORY-48

> Epic 1: one black-pill `Pošalji zahtjev` chrome on the salon profile, plus the header-only support line.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-48.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-48 |
| Source | `docs/stories/STORY-48.md` — Salon Pošalji zahtjev chrome |
| Goal (one sentence) | All four salon-profile `Pošalji zahtjev` share one CSS black pill (press + scale + ink ring; disabled hairline), and the idle header button gets one muted support line. |
| Branch name | `cursor/story-48-posalji-zahtjev-chrome-d71f` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk Hopic / 2026-09-13 |

## Pass/fail — product

- [ ] `esyres_app/frontend/src/lib/salonSend.ts` exports `SALON_SEND_CLASS` exactly `inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-canvas active:scale-[0.98] active:bg-[#242424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:scale-100 disabled:bg-hairline disabled:text-muted`. Inter is already `--font-sans` (14px = `text-sm`, 600 = `font-semibold`, 48px = `min-h-12`). No `py-3`, no `font-medium`, no `disabled:opacity-40`, no `transition`, no `animate-`, no `pulse`, no icon class, no new `@theme` token for `#242424` — verify: Vitest (`esyres_app/frontend/src/lib/salonSend.test.ts` equality + `index.css` still has `--color-hairline: #e5e7eb` and `--font-sans: Inter`; no `--color-ink-press`)
- [ ] All four `Pošalji zahtjev` use that constant as the pill class (call-site `mt-8` allowed on idle header/lower only): (1) idle header `type="button"`, (2) idle lower `type="button"`, (3) picker `type="submit"`, (4) chat `type="submit"` in `AssistantIntake.tsx`. All four labels are `t('salon.send')` (`Pošalji zahtjev`). Picker and chat submit must not use `t('salon.submit')`. Leave `salon.submit` in `i18n.ts` unused this PR (do not delete the key) — verify: Vitest reading `SalonProfile.tsx` + `AssistantIntake.tsx` (className includes `SALON_SEND_CLASS`; four `salon.send`; picker/chat have no `salon.submit`)
- [ ] i18n `bs`: `salon.send` stays `Pošalji zahtjev`. New `salon.sendHint` is `Odaberi usluge, dan i vrijeme.` No other new `salon.` / `assistant.` / `discovery.` keys — verify: Vitest reading `i18n.ts`
- [ ] Header idle (`hasServices && mode === 'idle'`, left `max-w-md`): after the header send button, one `<p className="mt-2 text-sm text-muted">{t('salon.sendHint')}</p>`. Same show/hide as the header button. Not under the lower idle button, not under picker submit, not under chat submit — verify: Vitest reading `SalonProfile.tsx` + `AssistantIntake.tsx` (`sendHint` only in the header idle block; absent from lower/picker/chat)
- [ ] Chat alternate stays `t('assistant.ask')` with underline classes (`underline underline-offset-4`); not `SALON_SEND_CLASS`; not `bg-ink` — verify: Vitest reading `SalonProfile.tsx`
- [ ] Behavior unchanged from STORY-47: header idle still `openIntake('picker')` + `setScrollPicker(true)`; lower idle still `openIntake('picker')` without scroll; picker/chat submit still send (`onSubmit` / existing chat submit); hide/show (`idle` header vs lower during chat vs `sent` / no services) unchanged. No sticky, no morph-to-form — verify: Vitest reading `SalonProfile.tsx` (existing header/lower/scroll assertions still pass; no `sticky`; no GSAP / Three)
- [ ] AuthShell, owner pills, My Bookings pills, TopNav, Homepage Pronađi salon are not restyled this PR — verify: Vitest (`authPlace.source.test.ts` / `topNav.source.test.ts` still green); those files are not in the diff except if an import is required (it must not be)
- [ ] Four pills read as one primary; support line only under the header idle button; chat alternate stays the underline — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (salon profile four black pills + header support line), `08-Decisions.md` #12 #15 #42, `docs/mvp/04-UI-Design-Goals.md` (salon `Pošalji zahtjev` chrome), `refs/design-1/DESIGN.md` (product pill).

- [ ] One React PWA. CSS/Tailwind only for press (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or booking mutations. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [ ] i18next `bs` only. One new copy key (`salon.sendHint`). No Playwright, RTL, Pest, GraphQL codegen — verify: `i18n.ts` as above; `package.json` unchanged deps
- [ ] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; no `features/` or `behat.yml` edits this PR

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + CSS + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Address, tappable hours, header CTA placement (STORY-47)
- Restyling AuthShell, owner, or My Bookings pills
- Sticky top-nav / dock
- Awwwards / GSAP / Three.js
- Photo, gallery, description
- Public pricing page
- Deleting `salon.submit` from i18n
- Changing send gates, `createBooking`, hide/show, or chat alternate copy
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-48.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `cursor/story-48-posalji-zahtjev-chrome-d71f` from current `master`.
3. **Class:** add `esyres_app/frontend/src/lib/salonSend.ts` + `salonSend.test.ts` with `SALON_SEND_CLASS` exactly as the first product check. Do not add a Button component. Do not add `--color-ink-press`.
4. **Copy:** `salon.sendHint` = `Odaberi usluge, dan i vrijeme.` Keep `salon.send`. Do not wire `salon.submit` on these four buttons; do not delete the key.
5. **SalonProfile:** idle header and idle lower `className={`mt-8 ${SALON_SEND_CLASS}`}` (or equivalent that still includes the constant). Header idle block: support `<p>` under the button. Picker submit: `className={SALON_SEND_CLASS}`, `t('salon.send')`, keep `disabled={!canSendPicker || busy}`. Keep `openIntake` / scroll / hide-show as today. Chat alternate unchanged.
6. **AssistantIntake:** chat submit uses `SALON_SEND_CLASS` + `t('salon.send')`; keep `disabled={!canSend || busy}`. No support line here.
7. **Vitest:** equality on the class string; source-read the four sites, `sendHint` placement, no `salon.submit` on picker/chat, no GSAP, chat alternate still underline. Update `salonProfile.source.test.ts` off the old `font-medium` / `py-3` pill regex. Keep `designPack.test.ts` / `authPlace.source.test.ts` / `topNav.source.test.ts` green.
8. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-48.md` Loop to `STORY-48`.
9. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
10. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
