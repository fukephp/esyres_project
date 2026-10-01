# Answer key: STORY-89

> Epic 2: always-on `Pošalji zahtjev` after a read-only hours list. Do not implement until this file is approved.
> Sharp path: no map. Locks from `docs/stories/STORY-89.md`, `docs/adr/0042-always-on-posalji-zahtjev.md`, and `docs/architecture/04-Frontend.md`.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-89 |
| Source | `docs/stories/STORY-89.md` — Always-on Pošalji zahtjev |
| Goal (one sentence) | Radno vrijeme is a read-only week, one `Pošalji zahtjev` after that list opens a request the guest leaves only with Zatvori, and the day inside is Danas / Sutra / Drugi dan. |
| Branch name | `story/STORY-89-always-on-posalji-zahtjev` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] Guest `/salon/:id` (same page after `GET /qr/{id}`): header keeps name and today’s busy; address when set. Radno vrijeme is a seven-row list (weekday, hours and break, or Zatvoreno). Rows are not buttons, have no selected-row chrome, and do not set a date. No `salon.sendHint` / `Odaberi dan da pošalješ zahtjev.` Usluge stay browse-only under category headings. `md+` aside stays empty — verify: Vitest `salonProfile.source.test.ts` (hours `<ul>` has no `<button`, no `onHoursTap`, no `showDaySendPill`, no `hoursRowTappable`, no `salon.sendHint`; aside slice has no `SALON_SEND_CLASS`)
- [ ] One `SALON_SEND_CLASS` pill, label `t('salon.send')` (`Pošalji zahtjev`), `w-full`, after the hours `</ul>` and before the Usluge section. Rendered only when the salon has services. Click opens the picker and does not call `createBooking`. The page does not render `salon.success` and does not hide the pill after a send — verify: Vitest `salonProfile.source.test.ts` and `salonSend.test.ts`
- [ ] Pitaj salon is not on the profile. `SalonProfile.tsx` does not render `AssistantIntake`, does not open a chat `<dialog>`, and does not `setMode('chat')`. `components/AssistantIntake.tsx` and the assistant GraphQL operations stay on disk — verify: Vitest `salonProfile.source.test.ts`; `test -f esyres_app/frontend/src/components/AssistantIntake.tsx`
- [ ] Picker shell stays: `SALON_PICKER_DIALOG_CLASS`, title `{salon.name}`, muted `text-sm text-muted` weekday + `formatPickerDayNumeric` only when the date is non-empty. **Zatvori** is the only dismiss: `onCancel` always `preventDefault` (Escape and the date popup), backdrop click does not set idle, send success does not close. Reopen-after-cancel matches the Telefon dialog (`allowClose` only from Zatvori) — verify: Vitest `salonProfile.source.test.ts`
- [ ] Logged out (`me == null`, after `me` has loaded): the form is hidden. One line `t('salon.loginToRequest')` = `Prijavi se ili se registruj da pošalješ zahtjev.`, then `AuthShell` (login and register). That auth callback does not call `createBooking`. Logged in: the form shows at once, with no login line — verify: Vitest `salonProfile.source.test.ts` and `i18n` equality
- [ ] One form, still `createBooking` → `requested`. No caller name and no phone-booking fields. Services (category checkboxes, duration + KM), worker radios with **Nema preference** when the salon has workers, then chips **Danas / Sutra / Drugi dan** (`salon.today` / `salon.tomorrow` / `salon.otherDay`, Telefon selected/idle classes, `aria-pressed`). Guest picker does not read `owner.phone.today`. No `type="time"` — verify: Vitest `salonProfile.source.test.ts` and `i18n` equality
- [ ] On each open, before any service, skip with hours only: first day from today through the next 6 Sarajevo days that is open and has an in-hours quarter. An in-hours quarter is a `:00` `:15` `:30` `:45` with start `>= opensAt` and start `< closesAt`, and the start is not inside `[breakStartsAt, breakEndsAt)`. Ignore Zauzet, past, and duration (no occupying query, no service length). Today → Danas and that date. Tomorrow → Sutra and that date. A later day → Drugi dan with date `''` (do not store that later day). None of the 7 → Danas and today’s date — verify: Vitest `salonHours.test.ts` (`guestHoursSkip`)
- [ ] Quarter pills only after at least one service and only when the date is non-empty. Guest rules stay: Zauzet and past visible and disabled; a `requested` row does not block; no preference is Zauzet only when every worker is blocked; no workers follows hours, break, close, and past. Closed day: `Salon je zatvoren taj dan.` Open day with nothing tappable: `Nema slobodnog termina.` (disabled pills stay when the list is non-empty). Send stays off in both. That is the empty line when Danas is selected and today does not qualify. Drugi dan with an empty date shows neither pills nor that line — verify: Vitest `guestQuarter.test.ts` (existing rules still pass) and `salonProfile.source.test.ts` (pills gated on `chosen.length > 0` and a known date)
- [ ] Drugi dan shows a native date with `min` today, then the same pills. Choosing today or tomorrow switches to Danas or Sutra and hides the date field. Choosing that date does not close the modal. Changing day (chip tap, a date that changes the YMD, or the today/tomorrow switch) clears the start and sets the worker to **Nema preference**. Tapping Drugi dan also clears the date. Changing services keeps the day, does not run the skip again, and clears a start that is no longer tappable (worker stays) — verify: Vitest `salonHours.test.ts` (`guestDayChange`, `guestAfterServiceChange`) and `salonProfile.source.test.ts` (date `onChange` has no `setMode('idle')`)
- [ ] Email and phone panels still appear inside the modal on those codes. A finished verify retries send when the form is complete. `UNAUTHENTICATED` on send shows the login step in the same modal and keeps the draft; that login does not send. A failed send, including **Već imaš ovu uslugu tog dana.**, leaves the modal open. Success replaces the form with `Zahtjev je poslan. Salon će odgovoriti.` Zatvori stays. One request per open. Zatvori returns to the profile; the next open is a blank draft and the skip runs again — verify: Vitest `salonProfile.source.test.ts`
- [ ] Owner Telefon is unchanged: still closes on a finished save, still types a Drugi dan time, date still has no `min`, backdrop/Escape still do not close it — verify: Vitest `phoneBooking.source.test.ts` (existing asserts still pass; no edit required if they stay green)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (read-only hours, pill after the list, Danas / Sutra / Drugi dan, Zatvori only, no profile chat), `docs/architecture/08-Decisions.md` #48 #49, and `docs/adr/0042-always-on-posalji-zahtjev.md`. Do not violate `docs/architecture/03-Backend.md` occupancy (`requested` does not block).

- [ ] One React PWA. No new npm package. No GraphQL, REST, or `createBooking` contract change. No `behat.yml` change. No sibling `marketing/` — verify: `git diff` has no `composer.json`, `graphql/`, `features/`, `behat.yml`, or `esyres_app/app/` change; `package.json` deps unchanged; `test ! -d esyres_app/marketing`
- [ ] i18next `bs` only. New keys limited to `salon.loginToRequest`, `salon.today`, `salon.tomorrow`, `salon.otherDay`. Remove `salon.sendHint` from the profile (drop the key if nothing else reads it). No Playwright — verify: Vitest reading `i18n.ts`
- [ ] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Expected skip. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **skip Behat** (frontend + git-root docs / `.cursor` only).

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

From **git root**:

```text
test ! -d esyres_app/marketing
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

- Owner Telefon (close on save, typed Drugi dan time, past day allowed)
- Deleting `AssistantIntake`, intake GraphQL, or the assistant API
- Changing `createBooking`, `quarterStarts`, or guest Zauzet rules
- Slot grid, sticky dock, filling the aside
- Homepage `Pošalji zahtjev` copy in Kako radi
- New npm, Playwright, PHP, or `behat.yml`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-89.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-89-always-on-posalji-zahtjev` from current `master`.
3. **`salonHours.ts`:** add `guestHoursSkip`, `guestDayChange`, and `guestAfterServiceChange`. Hours-only quarter as in the product checks. Do not call `quarterStarts` for the skip. Reuse `formatPickerDayNumeric`. Stop using `showDaySendPill` / `hoursRowTappable` / `applyHoursRowTap` on the profile (delete them if nothing else imports them).
4. **`SalonProfile.tsx`:** read-only hours rows; pill after the list; remove the chat dialog, intake restore, and `AssistantIntake` from this page. Picker dismiss matches Telefon (`preventDefault` on every cancel; Zatvori is the only close). Logged-out gate hides the form. Day chips + Drugi dan date (`min` today). Success stays inside the dialog. Do not set a page sent state. Do not change `SALON_SEND_CLASS` or `CREATE_BOOKING_MUTATION`.
5. **i18n:** add the four salon keys above. Chip labels are Danas, Sutra, Drugi dan.
6. **Vitest:** update `salonProfile.source.test.ts`, `salonHours.test.ts`, `salonSend.test.ts`, and `authPlace.source.test.ts` so they assert this key, not the STORY-65 under-row pill or the chat card.
7. **Docs:** set Loop to `STORY-89` on `docs/stories/STORY-89.md` and `docs/stories/index.md`. Do not rewrite STORY-65 or STORY-84.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
9. On pass: open a PR whose body links this key and lists the verify commands. Then remind: Bugbot, then human review and merge.
