# Answer key: STORY-59

> Epic 1: one idle `Pošalji zahtjev` on `/salon/:id` — under the title on a phone; `md+` compact sticky right booking sidebar.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-59.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-59 |
| Source | `docs/stories/STORY-59.md` — One idle Pošalji zahtjev; md+ booking sidebar |
| Goal (one sentence) | Guest `/salon/:id` has one idle send (hint + chat alternate in that block): under the title on a phone, in a sticky `w-64` sidebar on `md+`, never the STORY-47 header+lower pair. |
| Branch name | `cursor/story-59-booking-sidebar-ad5b` |
| Iteration cap | 8 |
| Status | draft |
| Approved by / date | |

## Pass/fail — product

- [ ] `esyres_app/frontend/src/lib/salonSend.ts` keeps `SALON_SEND_CLASS` unchanged (STORY-48 string). Adds exactly: `SALON_BOOKING_SPLIT_CLASS` = `mt-8 md:flex md:gap-8 md:items-start`; `SALON_BOOKING_ASIDE_CLASS` = `w-full md:order-2 md:w-64 md:shrink-0 md:sticky md:top-8 md:self-start`; `SALON_BOOKING_MAIN_CLASS` = `min-w-0 flex-1 md:order-1`. No `max-w-md` on those three. No `sticky` without the `md:` prefix. No new `@theme` token — verify: Vitest (`esyres_app/frontend/src/lib/salonSend.test.ts` equality on all four exports; `index.css` still has no `--color-ink-press`)
- [ ] Happy-path stack in `SalonProfile.tsx`: TopNav unchanged. Title + today’s busy, then address if set (omit if missing). Then **one** booking split when `hasServices && !sent` (not on loading / missing salon). DOM order inside the split: **aside first** (phone: under the title), then left main (hours → services → picker/chat/gates). `md:order-1` on main / `md:order-2` on aside so `md+` is left catalog + right sidebar. Title/busy/address stay **above** the split. Sent success copy stays **after** the catalog/form, outside the split. No second idle send in the file — verify: Vitest reading `SalonProfile.tsx` (split uses the three class constants; `hasServices && mode === 'idle'` header send block is gone; only one `hasServices && !picking && !sent` send button; `t('salon.success')` after the split)
- [ ] Show/hide on that **one** chrome block (today’s **lower** rules): send when `hasServices && !picking && !sent` (`type="button"`, `openIntake('picker')` **and** `setScrollPicker(true)` — idle and chat both scroll). Hint `salon.sendHint` only when `mode === 'idle'` (same `mt-2 text-sm text-muted` as STORY-48). Chat alternate when `showChatCta(salon.services.length, sent) && !chatting` (`assistant.ask`, underline, not `SALON_SEND_CLASS`). Hide send + hint + alternate when `sent` or no services. Do **not** keep a second lower send above the form — verify: Vitest reading `SalonProfile.tsx` (send click includes `setScrollPicker(true)`; `sendHint` only in the aside; `assistant.ask` not `bg-ink`; no `hasServices && !picking && !sent` **after** `t('salon.services')` as a second button)
- [ ] `md+` aside is the compact sidebar: `w-64`, sticky inside `main` (`md:sticky md:top-8 md:self-start`) while hours/services scroll. Phone: aside `w-full` (guest-column measure, **no** `max-w-md` wrapper), not sticky. Not a floating dock, not a sticky TopNav, not the owner aside, not an hours rail. Idle pill is `SALON_SEND_CLASS` (`w-full` of the aside). Picker `<form>` and `AssistantIntake` stay in left `max-w-md`. Login / email / phone gates stay in that left measure — verify: Vitest (`SALON_BOOKING_ASIDE_CLASS` as above; `SalonProfile.tsx` aside has no `max-w-md`; picker/chat/gates remain under a `max-w-md` in main; `TopNav` source has no `sticky`)
- [ ] Hours stay a seven-row list in the **left** main (weekday left, hours/break or Zatvoreno right). Open rows still seed the picker (STORY-47 helpers unchanged). Closed muted. No `md:grid-cols-2`, no right schedule rail. Hours section: `mt-8` when **not** in the split (sent / no services); **no** extra top margin when inside the split (the split’s `mt-8` is the gap under address). Service category jump list stays inside `SalonServiceGroups` (`hidden w-40 shrink-0 md:block` when ≥2 visible). Do not move it into the booking aside — verify: Vitest reading `SalonProfile.tsx` + `salonHours.ts` still imported; jump list regex unchanged; `onHoursTap` still `applyHoursRowTap` + `openIntake('picker')`; no hours markup in the aside
- [ ] Chrome count: **three** `Pošalji zahtjev` use `SALON_SEND_CLASS` + `t('salon.send')`: (1) idle aside `type="button"`, (2) picker `type="submit"`, (3) chat submit in `AssistantIntake.tsx`. Not four. Picker/chat must not use `t('salon.submit')`. `salon.send` / `salon.sendHint` / `assistant.ask` copy unchanged. No new i18n keys. CSS only. No icon, no GSAP, no Three.js, no second CTA color — verify: Vitest (`salonSend.test.ts` counts two `SALON_SEND_CLASS` in `SalonProfile.tsx` and one in `AssistantIntake.tsx`; no `salon.submit` on those; no `gsap` / `Three`; `i18n.ts` send/sendHint/ask unchanged)
- [ ] Sent, no services, loading, missing salon: no booking split / no aside column (hours+services+form span the guest column). Picker/chat mutual exclusion, `createBooking`, and send gates unchanged — verify: Vitest reading `SalonProfile.tsx` (split gated on `hasServices && !sent`; loading/notFound early returns still only TopNav + `GUEST_COLUMN_CLASS` main; `CREATE_BOOKING_MUTATION` still the send path)
- [ ] Phone: one send under the title, then hours; sidebar not sticky. `md+`: sticky `w-64` sidebar on the right; title/busy/address above the split — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/salon/:id` one idle send + `md+` sticky booking sidebar), `08-Decisions.md` #12 #15 #42, `docs/mvp/04-UI-Design-Goals.md` (salon `Pošalji zahtjev` chrome), `refs/design-1/DESIGN.md` (compact sticky booking sidebar; product pill).

- [ ] One React PWA. CSS/Tailwind only (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or booking mutations. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [ ] i18next `bs` only. No new copy keys. No Playwright, RTL, Pest, GraphQL codegen — verify: `i18n.ts` send/sendHint/ask unchanged; `package.json` unchanged deps
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

- Hours rail / moving weekly hours into the sidebar
- Sticky TopNav, phone dock, or relocating the picker/chat form above hours
- Photo, gallery, description, maps
- Owner surfaces, discovery, homepage
- Changing picker vs chat mutual exclusion, `createBooking`, or send gates
- Rewriting STORY-45 inventory text (this story supersedes “no two-column salon” for `md+` booking chrome only)
- STORY-60 accordion
- Awwwards / GSAP / Three.js
- Public pricing page
- Playwright, RTL, Pest, GraphQL codegen, new npm
- New i18n keys

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-59.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `cursor/story-59-booking-sidebar-ad5b` from current `master`.
3. **Classes:** extend `esyres_app/frontend/src/lib/salonSend.ts` with the three layout constants in the first product check. Do not change `SALON_SEND_CLASS`. Do not add `--color-ink-press`.
4. **SalonProfile:** delete the STORY-47 header idle block (`hasServices && mode === 'idle'` + `max-w-md`) and the lower idle send that sits above the form. One `<aside>` in a split with `SALON_BOOKING_*` classes. `showBookingColumn = hasServices && !sent`. Catalog (hours, services, `max-w-md` form) in `SALON_BOOKING_MAIN_CLASS` when the column shows; same catalog spans the guest column when it does not. Extract a local fragment/variable so hours/services/form are not copy-pasted. Aside DOM-first. Hours `mt-8` only outside the split.
5. **Clicks:** aside send → `openIntake('picker')` + `setScrollPicker(true)`. Chat alternate → `openIntake('chat')` only (no scroll). Hours tap unchanged (still scrolls when `applyHoursRowTap` says so).
6. **Vitest:** equality on the new class strings; rewrite `salonProfile.source.test.ts` stack/header/lower/sticky assertions for one aside; rewrite `salonSend.test.ts` from four pills to three. Keep jump-list, hours helpers, address omit, `designPack.test.ts` / `authPlace.source.test.ts` / `topNav.source.test.ts` green. Assert TopNav has no `sticky`.
7. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-59.md` Loop to `STORY-59`.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
