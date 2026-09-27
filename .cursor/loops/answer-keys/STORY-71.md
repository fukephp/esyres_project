# Answer key: STORY-71

> Epic 7: owner password change on `/owner/settings`. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-71 |
| Source | `docs/stories/STORY-71.md` — Owner settings password |
| Goal (one sentence) | An owner changes the shared account password on Postavke and stays signed in on this device. |
| Branch name | `story/STORY-71-owner-settings-password` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-27 |

## Pass/fail — product

- [ ] `/owner/settings` is a lazy route (Suspense fallback `salon.loading`, same as other owner routes). Owner-ready page matches the salon catalog overlay: `TopNav`, `min-h-svh md:flex`, aside `OwnerNav` `active="settings"`, phone `OwnerNav` in `md:hidden`, `main` `flex-1 px-5 py-8`. No salon switcher (`t('owner.salon')` / `onSalon`). No `?salon=` on this page or on the Postavke link. `useOwnerPush` only when owner-ready, badge from `inFlightIntakeCount` on the first owned salon — verify: Vitest `ownerSettings.source.test.ts`; extend owner-page lists in `topNav.source.test.ts`, `authPlace.source.test.ts`, `ownerSalons.source.test.ts`, `designPack.test.ts` to include `pages/OwnerSettings.tsx`
- [ ] Logged-out: `auth.placePanel` + `AuthShell` `allowRegister={false}`. Unverified email: `auth.placePanel` + `EmailVerifyPanel`. Not-owner: `owner.title` + `owner.notOwner` + link `CREATE_SALON_PATH` / `owner.createSalon`. Those three returns are not the settings form — verify: Vitest `authPlace.source.test.ts` (settings file in the owner shell list) and `ownerSettings.source.test.ts` (not-owner block matches `OwnerSalons`)
- [ ] `OwnerNav` order stays Zahtjevi, Razgovori, Statistika, Saloni, then fifth **Postavke** (`owner.settings` → `/owner/settings`, `active === 'settings'`). That link has no salon query. Every existing owner overlay still renders `OwnerNav` — verify: Vitest `ownerSalons.source.test.ts` (link after `owner.salons`; settings page in the `<OwnerNav` list) and `topNav.source.test.ts`
- [ ] Owner-ready h1 is `owner.settings` (**Postavke**). Muted read-only email is `me.email` in `text-body` (not an input). Form labels `owner.passwordCurrent` / `owner.passwordNew` / `owner.passwordConfirm`; three `type="password"` inputs; submit `owner.save` (**Spremi**), ink button, `disabled` while saving. No name field, no email input, no show/hide toggle — verify: Vitest `ownerSettings.source.test.ts` and `owner.test.ts` (`i18n.t` strings)
- [ ] Confirm mismatch is UI-only: if new ≠ confirm, set `owner.passwordMismatch` (**Lozinke se ne poklapaju.**) and return before `CHANGE_PASSWORD_MUTATION`. Do not send the confirm field — verify: Vitest source (early return before the mutation; mutation document has `currentPassword` and `password` only)
- [ ] Sessioned GraphQL `changePassword(currentPassword: String!, password: String!): User!` for any logged-in user (no email-verified gate, no owner gate). Guest → `UNAUTHENTICATED`. Wrong current → `INVALID_CURRENT_PASSWORD` (not `INVALID_CREDENTIALS`); password unchanged. New shorter than 8 characters → existing `WEAK_PASSWORD`; password unchanged. New may equal current and still succeeds. No trim. No `logoutOtherDevices` — verify: Behat `features/guest/change_password.feature`
- [ ] Success stays signed in: `session()->regenerate()` (default, do not destroy other sessions), `me` on this cookie is the same email, three fields cleared, `owner.passwordChanged` (**Lozinka je promijenjena.**). Login with the old password then fails `INVALID_CREDENTIALS`; login with the new password succeeds. A session cookie captured before the change still returns `me` for that user after the change — verify: Behat `features/guest/change_password.feature` (cookie snapshot + restore); Vitest source (clear the three state fields and render `owner.passwordChanged` on success)
- [ ] UI maps `INVALID_CURRENT_PASSWORD` to **Pogrešna trenutna lozinka.** and reuses `auth.gate.WEAK_PASSWORD` (**Lozinka mora imati najmanje 8 karaktera.**). Bosnian `bs` only — verify: Vitest `owner.test.ts` / `ownerSettings.source.test.ts`

## Pass/fail — architecture

Cite `docs/architecture/06-Auth-Notifications-Realtime.md` (sessioned `changePassword`, stay signed in, forgot-password unused), `04-Frontend.md` (`/owner/settings`, Postavke, no `?salon=`), `docs/glossary.md` (Owner settings), `docs/mvp/03-Key-Features.md` (password only).

- [ ] One React PWA + Lighthouse GraphQL. Mutation resolver `App\GraphQL\Mutations\ChangePassword`. Sanctum session cookie. No REST password route, no `password_reset_tokens` migration, no `AuthenticateSession`, no customer `/settings` route, no `esyres_app/marketing` — verify: diff has no new migration; `App.tsx` has `/owner/settings` and no `/settings`; `rg logoutOtherDevices` and `rg password_reset` under `esyres_app/app` stay empty of a new reset flow
- [ ] Classifier: this PR touches PHP, `graphql/schema.graphql`, and `features/` → **Behat runs** (not frontend-only). Do not change `behat.yml`. Flags stay CLI-only — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main`. This repo’s default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **Behat runs** (PHP + schema + features).

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

- Customer `/settings` or a password form on My Bookings
- Forgot-password, reset emails, `password_reset_tokens`
- Email or name change, 2FA, language, device list, show/hide password
- Salon PIN or a second owner password
- Worker logins
- Rate limits or a max length beyond the existing 8-character `WEAK_PASSWORD` check
- Logging out other devices

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-71.md`, `docs/architecture/06-Auth-Notifications-Realtime.md`, `docs/glossary.md` (Owner settings). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-71-owner-settings-password` from current `master`.
3. Schema: `changePassword(currentPassword: String!, password: String!): User!` next to `login` / `register`. Resolver checks `context->user()` is a `User`, else `UNAUTHENTICATED`. `Hash::check` current against the user; fail → `INVALID_CURRENT_PASSWORD` before save. `strlen($args['password']) < 8` → `WEAK_PASSWORD` before save (same rule as `Register`; do not trim). Set `password`, `save()`, `$context->request()->session()->regenerate()`, return the user. Do not call `Auth::logout`, `Auth::login`, or `logoutOtherDevices`. Do not require verified email or a salon.
4. Page `OwnerSettings.tsx`: copy the `OwnerSalons` loading / logged-out / unverified / not-owner returns. Owner-ready: catalog overlay, h1 `owner.settings`, email line, form as above. Wire `CHANGE_PASSWORD_MUTATION` in `frontend/src/graphql/auth.ts`. Mismatch return before mutate. On success clear the three fields and show `owner.passwordChanged`. Map the two error codes. Register the lazy route in `App.tsx`.
5. `OwnerNav`: fifth link, `active: 'settings'`, constant path with no query. Add `pages/OwnerSettings.tsx` to the existing owner-page source lists (`topNav`, `authPlace`, `ownerSalons`, `designPack`).
6. i18n `bs` only: `owner.settings` Postavke; `owner.passwordCurrent` Trenutna lozinka; `owner.passwordNew` Nova lozinka; `owner.passwordConfirm` Ponovi lozinku; `owner.passwordMismatch` Lozinke se ne poklapaju.; `owner.passwordChanged` Lozinka je promijenjena.; `owner.passwordError.INVALID_CURRENT_PASSWORD` Pogrešna trenutna lozinka. Reuse `auth.gate.WEAK_PASSWORD`.
7. Behat `features/guest/change_password.feature`: guest unauthenticated; verified customer wrong current; weak new; new equals current; success then old login fails and new login works; unverified session (after register) may change password; snapshot the session cookie, change password, `me` still that email on the new cookie, restore the snapshot, `me` still that email. Add the smallest cookie snapshot/restore steps on the existing Behat context. No new suite.
8. Set Loop to `STORY-71` on `docs/stories/STORY-71.md` and `docs/stories/index.md`.
9. Loop: implement → classifier → matching verify (expected full Behat from `esyres_app/`) → fix. Cap 8. Same failure twice → escalate.
10. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
