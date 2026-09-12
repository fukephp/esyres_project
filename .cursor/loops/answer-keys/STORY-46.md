# Answer key: STORY-46

> Epic 2: person name at register; AuthShell place headings Rezervacije vs Panel.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-46.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-46 |
| Source | `docs/stories/STORY-46.md` — Person name at register; Rezervacije vs Panel |
| Goal (one sentence) | Register stores a typed person name (not an email local-part), and AuthShell shows Rezervacije on customer doors and Panel on create-salon / owner doors. |
| Branch name | `cursor/story-46-person-name-726a` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-12 |

## Pass/fail — product

- [ ] GraphQL `register(name: String!, email: String!, password: String!, phone: String): User!`. `login` stays `login(email: String!, password: String!)` with no name arg. Resolver trims `name`. Empty or whitespace-only → `INVALID_NAME`. One word (`Ana`) is enough. Do not mint `users.name` from the email local-part (`explode('@', …)` gone from `Register.php`). Success: `me.name` and the `users.name` column are that trimmed string. Existing rows are not backfilled (no migration/update of `users.name`) — verify: Behat (`features/guest/register.feature`: success `me name is "Ana"` for `ana@example.com`; trim `"  Ana  "` → `"Ana"`; `""` / `"   "` → `INVALID_NAME`; named `"Ana"` with a different local-part still `"Ana"`). Existing `I register as :email with password :password` (and the phone variant) send default name `"Ana"` so sibling features keep working. Named Gherkin step for the explicit cases.
- [ ] Register UI (customer + `/create-salon`): when mode is register, first field is **Ime i prezime** (`auth.name`), then email, password, optional phone. Login mode has no name field. Tabs stay Prijava / Registracija. `/owner*` AuthShell stays `allowRegister={false}` — verify: Vitest reading `AuthShell.tsx` + i18n; owner pages still `allowRegister={false}`
- [ ] i18n `bs`: `auth.name` is `Ime i prezime`; `auth.gate.INVALID_NAME` is `Unesi ime i prezime.`; `auth.placeCustomer` is `Rezervacije`; `auth.placePanel` is `Panel`. `createSalon.INVALID_NAME` stays `Unesi ime salona.`; `bookings.title` stays `Moji zahtjevi`; `home.panel` stays `Panel` (CTA, not the place heading key) — verify: Vitest (`i18n.ts`)
- [ ] AuthShell maps GraphQL `INVALID_NAME` to `auth.gate.INVALID_NAME`. Create-salon name form still maps `INVALID_NAME` to `createSalon.INVALID_NAME` — verify: Vitest reading `AuthShell.tsx` + `CreateSalon.tsx`
- [ ] `PLACE_HEADING_CLASS` in `esyres_app/frontend/src/lib/homepage.ts` is exactly `font-display text-[28px] font-semibold tracking-tight text-ink`. Full-page place headings are `<h1 className={PLACE_HEADING_CLASS}>`. Salon send and assistant use the same class on a `<p>`, not an `h1` — verify: Vitest (`homepage.test.ts` + source tests on Homepage, MyBookings, CreateSalon, owner pages, SalonProfile, AssistantIntake)
- [ ] Customer **Rezervacije** (`auth.placeCustomer`) on: homepage AuthShell, logged-out `/bookings` AuthShell, salon send AuthShell, assistant AuthShell. After login, `/bookings` h1 stays `bookings.title` (`Moji zahtjevi`). Logged-in customer email-verify stays as today (that title + `EmailVerifyPanel`) — verify: Vitest reading those files
- [ ] Panel **Panel** (`auth.placePanel`) on: `/create-salon` AuthShell and email-verify, and all `/owner*` logged-out AuthShell and email-verify. Those owner early returns must not use `owner.title` / `owner.chat` / `owner.stats` as that heading. After a verified session, those owner page titles return. Create-salon **Ime salona** form has no `auth.placePanel` heading — verify: Vitest reading `CreateSalon.tsx` + `OwnerHome.tsx` / `OwnerChats.tsx` / `OwnerStats.tsx` / `OwnerRequestDetail.tsx`
- [ ] Homepage: `nextHomepageAuth(current, click)` — same-mode click closes (`login`+`login` → `null`); other tab switches; `null`+click opens that mode. While `authOpen` is set: do not render pitch (`pitch.h1` / support / steps / Pronađi salon) or footer (`home.footerCity` / `home.footerLine`); **Rezervacije** is the page `h1` (`PLACE_HEADING_CLASS`, not `pitch-display`); AuthShell form stays left `max-w-sm` (h1 is not inside that `max-w-sm`). Closing (toggle or success) brings pitch + footer back. Top-nav Prijava/Registracija still work as the toggle. Get your panel stays in the bar. Not a login wall when auth is closed — verify: Vitest (`nextHomepageAuth` + reading `Homepage.tsx` / `TopNav` wiring)
- [ ] Place headings read as Rezervacije vs Panel on the two doors; homepage auth hides hero+footer and toggle restores Pronađi salon — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (register person name), `04-Frontend.md` (AuthShell Rezervacije vs Panel; homepage auth hides hero+footer), `05-Data-Model.md` (`User.name` not from local-part), `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #4, `docs/glossary.md` **Person name**.

- [ ] Lighthouse `/graphql` only; `register` gains `name`; no REST auth, no Fortify/Breeze, no `/profil` `/prijava` `/registracija` routes — verify: schema + Behat hits `/graphql`; no new web auth routes
- [ ] Sanctum session on register/login unchanged. Verify-email dispatch on register unchanged. Phone still optional at register — verify: existing register/email-verify/phone Behat still pass after default name `"Ana"`
- [ ] One React PWA. i18next `bs` only. No Playwright, RTL, Pest, GraphQL codegen, new npm, or sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`
- [ ] Do not center AuthShell, add a header person-name Link, change Odjava hover, backfill names, add a name editor, or a second owner signup — verify: product checks + no new profile/name-edit route

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`). This story touches PHP / GraphQL / Behat — classifier will **not** skip Behat. Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

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

**If Behat runs** (expected for this story; or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Header person name as a Link
- Centering AuthShell
- Odjava hover
- `/profil`, `/prijava`, `/registracija` routes
- OAuth
- Requiring a space / two words
- Backfill or a name editor
- Second owner signup
- Public pricing page
- Playwright, RTL, Pest, GraphQL codegen, new npm
- Sticky top-nav, guest-column / Design 1 retune, owner aside layout

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-46.md`, `docs/glossary.md` (Person name), `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #4. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: `cursor/story-46-person-name-726a` from current `master`.
3. **GraphQL / PHP:** `register(name: String!, email: String!, password: String!, phone: String)`. Trim name; blank/whitespace → `ClientError('INVALID_NAME')`. `$user->name = $trimmed`. Delete `explode('@', $email)[0]`. Do not add a backfill migration. `login` unchanged.
4. **Behat:** extend `registerMutation` with `$name`. Existing register steps send `"Ana"` when Gherkin omits a name. Add `I register as :email named :name with password :password` (and phone variant). Update `register.feature` success from local-part `"ana"` to `"Ana"`. Add trim / whitespace / empty / not-local-part scenarios. Do not rewrite every sibling feature’s wording.
5. **PWA AuthShell:** register-only name field first (`auth.name`). Send trimmed `name`. Map `INVALID_NAME` → `auth.gate.INVALID_NAME`. Login: no name field. Tabs unchanged. Do not put the place heading inside AuthShell (homepage h1 must span the guest column; form stays `max-w-sm`).
6. **Place headings:** parents render them. Export `PLACE_HEADING_CLASS`. Customer `h1`/`p` uses `auth.placeCustomer`; panel uses `auth.placePanel`. Salon send + `AssistantIntake` login chrome: `<p className={PLACE_HEADING_CLASS}>` above AuthShell. Owner logged-out + email-verify early returns: Panel `h1`, not Zahtjevi/Chat/Statistika. Verified owner surfaces keep today’s titles. Create-salon auth + verify: Panel `h1`; Ime salona form: none.
7. **Homepage:** add `nextHomepageAuth` and wire TopNav Prijava/Registracija to it. While open: hide pitch + footer; Rezervacije `h1` with `PLACE_HEADING_CLASS`; form `max-w-sm` left. Success still `setAuthOpen(null)`.
8. **Logged-out `/bookings`:** place h1 Rezervacije (not `bookings.title`). Logged-in title unchanged.
9. **Tests:** Vitest for i18n keys, `PLACE_HEADING_CLASS`, `nextHomepageAuth`, and source reads listed above. Update `topNav.source.test.ts` / homepage tests that assumed pitch is always the homepage h1.
10. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-46.md` Loop to `STORY-46`.
11. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate.
12. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
