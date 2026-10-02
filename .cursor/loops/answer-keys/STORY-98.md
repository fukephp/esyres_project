# Answer key: STORY-98

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-98 |
| Source | `docs/stories/STORY-98.md` — Auth box |
| Goal (one sentence) | One shared auth box (card on pages, bare in modals) with sliding Prijava / Registracija chips, eye toggle, and forgot pane everywhere, plus Laravel-broker password reset that logs out that user's sessions. |
| Branch name | `story/STORY-98-auth-box` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-02 (grill round 1, all recommended) |

## Pass/fail — product

- [ ] `requestPasswordReset(email)` is a guest mutation that returns true for an existing email, an unknown email, and a second call within a minute; a queued `App\Notifications\ResetPassword` is sent only on the first call for the existing account — verify: Behat `features/guest/password_reset.feature`
- [ ] The reset mail URL is `{SpaUrl::origin()}/reset-password?token=…&email=…` — verify: Behat `password_reset.feature`
- [ ] `resetPassword(email, token, password)` with a valid token sets the new password (old login → `INVALID_CREDENTIALS`, new login succeeds) and returns true; the token is single use (second use → `INVALID_RESET_TOKEN`) — verify: Behat `password_reset.feature`
- [ ] Bad token, expired token (>60 min via test clock), or unknown email → `INVALID_RESET_TOKEN`; password < 8 → `WEAK_PASSWORD` and the token still works afterwards — verify: Behat `password_reset.feature`
- [ ] Success deletes every `sessions` row of that user (seeded row asserted gone), and when the current session is that user, `me` is null after; a different logged-in user stays logged in — verify: Behat `password_reset.feature`
- [ ] `AuthShell` has no `allowRegister` prop and no caller passes it; every surface (homepage, `/bookings`, `/create-salon`, all `/owner*` gates, salon modal, assistant) renders AuthShell with Registracija — verify: Vitest `authBox.source.test.ts` (+ updated `authPlace` / `zapisi` / `ownerSettings` source tests)
- [ ] Page surfaces use `AuthShell` page variant: centered card (`bg-canvas`, `border-hairline`, `rounded-3xl`, ~`max-w-[400px]`) with the place heading (Rezervacije / Panel) centered inside; callers no longer render a separate heading above it. Modals use `variant="modal"` (no card, no heading) — verify: Vitest `authBox.source.test.ts`
- [ ] Chips Prijava / Registracija: inactive plain text, active black pill (`bg-ink text-canvas`) as a sliding indicator; panel slides + fades in tab direction (~200ms); box height transitions via `ResizeObserver`; `motion-reduce` disables transitions — verify: Vitest `authBox.source.test.ts`
- [ ] Password fields have an eye toggle (aria `Prikaži lozinku` / `Sakrij lozinku`); no subtitle, Google, or "Or" divider — verify: Vitest `authBox.source.test.ts`
- [ ] **Zaboravljena lozinka?** under Lozinka on Prijava opens the forgot pane (not a chip); **Nazad na prijavu** returns; submit always shows `Ako račun postoji, poslali smo link.` — verify: Vitest `authBox.source.test.ts`
- [ ] `/reset-password` route: TopNav empty slot (greeting when named), card heading Rezervacije, **Nova lozinka** field; success shows `Lozinka je promijenjena.` on Prijava with email filled, clears Apollo `me`; login there navigates `/`; `INVALID_RESET_TOKEN` shows `Link je istekao ili nije ispravan.` + button to the forgot pane — verify: Vitest `authBox.source.test.ts`
- [ ] Layout and motion feel on page and modal surfaces — verify: human-only: merge visual review (UI ready rule)

## Pass/fail — architecture

- [ ] Laravel password broker on existing `password_reset_tokens`; no new token table, no new npm package — verify: diff review (`git diff --name-only`; no new migration for tokens; `package.json` deps unchanged)
- [ ] Mail queued like verify (`ShouldQueue` notification); link goes to the PWA, not Blade — verify: Behat `password_reset.feature`
- [ ] GraphQL schema adds only `requestPasswordReset(email: String!): Boolean!` and `resetPassword(email: String!, token: String!, password: String!): Boolean!` (guest-callable) — verify: Behat + `docs/architecture/06-Auth-Notifications-Realtime.md`

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; repo default branch is `master`). This story changes PHP/graphql/features, so Behat runs.

**If skipped** — from `esyres_app/frontend/`:

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Google or social login; subtitle; third Lozinka chip; auto-login after reset
- Phone OTP login changes; customer password change outside `/owner/settings`
- Bosnian reset mail copy (Laravel default text, like verify)
- Email-verify panels and other non-auth screens

## Implementer instructions

1. Read this key, the map (`.cursor/loops/maps/STORY-98.md`), `.cursor/CONTEXT.md`, and the story. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch `story/STORY-98-auth-box` from `master`.
3. Backend: `App\Notifications\ResetPassword` (Laravel subclass, `ShouldQueue`, URL via `SpaUrl`); `User::sendPasswordResetNotification`; resolvers `RequestPasswordReset`, `ResetPassword` (weak check first; broker; on success delete `sessions` rows for user, rotate remember token, logout+invalidate when same user); schema; Behat `features/guest/password_reset.feature` + steps.
4. Frontend: rewrite `AuthShell` (variant page|modal, place heading, chips, slide, height, eye, forgot pane); update every caller; add `/reset-password` page + route; i18n keys; `authBox.source.test.ts`; fix tests that asserted `allowRegister={false}` or heading-outside-shell.
5. Loop implement → classifier → verify; cap 8; stop on a repeated failure.
6. Open a PR linking this key; no screenshots. Then Bugbot → human merge.
