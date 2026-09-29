# Answer key: STORY-76

> Epic 3: Telefon becomes modal steps on Zahtjevi. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-76 |
| Source | `docs/stories/STORY-76.md` — Telefon modal |
| Goal (one sentence) | An owner writes a confirmed phone booking from a modal on Zahtjevi, with Danas / Sutra / Drugi dan and quarter-hour start pills, without changing the create-phone-booking server contract. |
| Branch name | `story/STORY-76-telefon-modal` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-29 |

## Pass/fail — product

- [ ] Zahtjevi keeps the ink **Telefon** control on the right of the Cal card, on the row above the month/list split. It is a button that opens the modal, not a link to `/owner/phone`, not an OwnerNav item, and not a month cell. The modal uses `SALON_PICKER_DIALOG_CLASS` (`showModal`): phone full-viewport sheet, `md+` centered card. Title **Telefon**. Close control **Zatvori**. Backdrop click, dialog cancel (Escape), **Zatvori**, or **Nazad** on the first step closes and drops the draft. A focused `type=date` does not dismiss it (`dialogCancelShouldClose`). A salon id change closes the modal and drops the draft. Each open starts blank. The day step does not read Zahtjevi’s `date` — verify: Vitest `phoneBooking.source.test.ts`
- [ ] `/owner/phone` redirects to Zahtjevi for the same salon and day (`ownerQueuePath` from that URL’s `date` and `salon`) and does not open the modal. The route is no longer an owner shell (no `TopNav`, no `OwnerNav`, no wizard). Drop `pages/OwnerPhoneBooking.tsx` from the owner-shell lists in `topNav.source.test.ts`, `authPlace.source.test.ts`, `ownerSalons.source.test.ts`, and `designPack.test.ts` — verify: Vitest `phoneBooking.source.test.ts` plus those four files still green
- [ ] Four steps, one at a time, values kept on **Nazad** except the clears below. Headings **Usluge**, **Dan i vrijeme**, **Radnik**, **Pozivalac**. Step 1: services under that salon’s category headings, checkboxes, none pre-checked; **Dalje** disabled until at least one is checked. Step 4: **Ime i prezime**, **Telefon (opcionalno)**, **Bilješka (opcionalno)**, submit **Spremi**. Blank or whitespace caller name sets **Unesi ime.** and does not send `createPhoneBooking`. A rejected save stays on step 4 with one line under **Spremi** — verify: Vitest `phoneBooking.source.test.ts`
- [ ] Day step chips are **Danas**, **Sutra**, and **Drugi dan**. The window is Sarajevo today, not the Zahtjevi day. The first time the day step opens, after hours and occupying rows for today through the next 6 days are loaded, it selects the first of those 7 days that has a legal start. Today selects Danas. Tomorrow selects Sutra. A later day selects Drugi dan, shows the native date filled with that day, and lists that day’s pills. If none of the 7 have a legal start, Danas stays selected and that day’s empty line shows. A later tap on Danas, Sutra, or Drugi dan stays on that chip even when it has no pills. The skip does not run again, including after a service change, and it does not look at yesterday. Until that range load succeeds, the day step shows `salon.loading` and does not commit a chip — verify: Vitest `owner.test.ts` (`phoneSkipDate`, `phoneDayChip`) and `phoneBooking.source.test.ts` (chips, no `min` on the date, skip gated on the range query, `salon.loading`)
- [ ] Drugi dan reveals a native date with no `min`. Choosing today or tomorrow in that field selects Danas or Sutra and hides the field. Tapping Drugi dan while it has no date clears the start and the worker and shows no pills and no empty-state line. A past date still offers legal starts for that weekday — verify: Vitest `owner.test.ts` (`phoneDayChip`) and `phoneBooking.source.test.ts` (date input has no `min`)
- [ ] A legal start is a clock quarter (`:00`, `:15`, `:30`, `:45`) whose range fits that day’s open hours, does not sit in or span the break, and has at least one worker free for the whole range. The range is the start plus the service durations, summed and rounded up to 15 minutes. Earlier today is included. Pills are chronological `HH:mm`, none pre-selected. Off-grid minutes are not offered. Changing the day clears the start and the worker. Changing services keeps the day, does not re-run the skip, and clears the start and the worker only when the old start is no longer legal; if that day then has no legal start, it shows the empty line. A closed day shows **Salon je zatvoren taj dan.** An open day with no fitting start shows **Nema slobodnog termina.** Do not show both — verify: Vitest `owner.test.ts` (`phoneLegalStarts`, `phoneAfterServiceChange`)
- [ ] The worker step lists name buttons (not a `<select>`) of workers free for the chosen start. No “Nema preference”. Exactly one free name is already selected (`aria-pressed`). Several names start with none selected and **Dalje** stays off until one is pressed. If none remain, it shows **Nema slobodnog radnika.** and **Dalje** stays off. Going back to this step keeps a still-free selection — verify: Vitest `phoneBooking.source.test.ts` and `owner.test.ts` (`phoneWorkerSelection`)
- [ ] Save still calls `createPhoneBooking` with the same input as STORY-74 (trimmed name, trimmed phone, trimmed note). After a successful save the modal closes and Zahtjevi shows that saved day (`ownerSearchParams` / the queue `date`), including when that day was already selected (occupying list refetches). The new row is the existing occupying row (service snapshot names and worker). Request Detail, owner cancel, and no-show are unchanged — verify: Vitest `phoneBooking.source.test.ts` (mutation input, navigate or `setParams` to the saved date, refetch); `OwnerRequestDetail.tsx` still matches the STORY-74 phone cancel assertions in that file

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (Telefon modal on Zahtjevi; `/owner/phone` redirects and does not open it), `docs/adr/0038-phone-booking-without-customer.md`, `docs/architecture/05-Data-Model.md` (phone booking born confirmed, no customer).

- [ ] One React PWA. No new REST route, no schema change, no migration, no edit to `CreatePhoneBooking` or `CancelPhoneBooking`. Reuse `occupyingBookings` / `occupyingBookingsRange` and `phoneRangeOpen` / `phoneFreeWorkerIds`. Requesting `preferredDate` on the existing range selection is allowed. Do not add a worker login or a 15-minute board — verify: `git diff --name-only master...HEAD` has no paths under `esyres_app/app/`, `esyres_app/graphql/`, `esyres_app/features/`, or `esyres_app/database/`
- [ ] Classifier: this PR is frontend plus `docs/stories/` only → **Behat skipped**. Do not `compose up` or run `php artisan --version`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **frontend-only** (no PHP, schema, features, or Composer).

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

- Changing the create-phone-booking or cancel-phone-booking server contract
- Request Detail, owner cancel, and no-show (leave STORY-74 behavior)
- A 15-minute worker board, drag, or an hour-cell grid
- Autofill of the next free start, last-caller memory, and a mid-call soft-hold
- Voice recording, a bubble transcript, and an agent that books from audio
- Worker login and receptionist roles
- Owner reschedule
- Empty-cell create on the day list
- Linking the caller to a customer user
- Push, SMS, or email for this booking
- A salon switcher inside the modal

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-76.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-76-telefon-modal` from current `master`.
3. Four steps, same grouping as STORY-74. Caller name, phone, and note stay one step. Day and start stay one step.
4. Put the modal on Zahtjevi. Replace the **Telefon** `Link` with a button that opens it. Shell: native `<dialog>` + `SALON_PICKER_DIALOG_CLASS` + the picker cancel/backdrop pattern (`dialogCancelShouldClose`). Title `owner.phone.title`. Close `salon.close`. **Nazad** (`owner.back`) on step 0 closes and resets. Later **Nazad** only decrements the step.
5. `/owner/phone` renders a redirect to `ownerQueuePath` for that URL’s salon and day. It must not set any “open the modal” flag. Remove that file from the owner-shell lists named above once it no longer has `TopNav` / `OwnerNav`.
6. Pure helpers in `esyres_app/frontend/src/lib/owner.ts`, tested in `owner.test.ts`:
   - `phoneLegalStarts` — quarters only; reuse `phoneRangeOpen` and `phoneFreeWorkerIds`; chronological; no “now” cutoff.
   - `phoneSkipDate(today, hasLegalStart)` — first of today..+6 (`shiftOwnerDate`) with a legal start, else today.
   - `phoneDayChip(date, today)` — `today` | `tomorrow` | `other`.
   - `phoneAfterServiceChange` — keep day; clear time and worker only when the old time is not in the new legal starts.
   - `phoneWorkerSelection(freeIds, current)` — one free id → that id; several → keep `current` when it is still free, else `''`; none → `''`.
7. Day step. Chip labels `owner.phone.today` / `tomorrow` / `otherDay` = **Danas** / **Sutra** / **Drugi dan**. Closed copy reuses `owner.phone.error.SALON_CLOSED`. Empty open day is `owner.phone.noStart` = **Nema slobodnog termina.** Load occupying rows for today..+6 with the existing range query (add `preferredDate` to that selection if missing) plus salon hours. Run skip once per open, only after that load succeeds. Drugi dan’s date input has no `min`. Filling today or tomorrow switches the chip and hides the input. Tapping Drugi dan with an empty date clears time and worker and shows neither pills nor an empty-state line. Changing chips or the resolved day clears time and worker. Pills are buttons, none pressed until tapped. **Dalje** stays off until a pill is pressed.
8. Service change uses `phoneAfterServiceChange` and does not reset the skip flag. If the kept start’s selected worker is no longer free, `phoneWorkerSelection` clears them; it does not clear a still-legal start.
9. Worker step: one `<button type="button" aria-pressed>` per free name. Apply `phoneWorkerSelection` when the free set changes. **Dalje** disabled when the selection is empty. Zero free names: `owner.phone.noWorker` and no **Dalje**.
10. Save: same mutation variables as today. On success, close, reset, `setParams` to the saved `preferredDate` (same salon rules as `ownerQueuePath`), and refetch the queue occupying query so the row shows even when the date did not change.
11. `onSalon` while the modal is open resets and closes. `showModal` may inert the aside; the effect still runs if `salon` changes.
12. Bosnian `bs` only for the new strings. Reuse **Telefon**, **Dalje**, **Nazad**, **Spremi**, **Usluge**, **Dan i vrijeme**, **Radnik**, **Pozivalac**, **Zatvori**, **Unesi ime.**, **Nema slobodnog radnika.**, **Salon je zatvoren taj dan.**
13. Rewrite `phoneBooking.source.test.ts` to the checks above. Keep the Request Detail phone-cancel assertions. Set Loop to `STORY-76` on `docs/stories/STORY-76.md` and `docs/stories/index.md`.
14. Loop: implement → classifier → matching verify (expected host npm from `esyres_app/frontend/`) → fix. Cap 8. Same failure twice → escalate.
15. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
16. After PR: Bugbot; nits on the same PR. If Bugbot contradicts this key, stop and ask.
