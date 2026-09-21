# Answer key: STORY-69

> Epic 7: description, main image, and gallery on salon edit Informacije.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-69.md` (compiled). Locks from `docs/stories/STORY-69.md` and the story-loop grill (Q1–Q6 all A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-69 |
| Source | `docs/stories/STORY-69.md` — Description, main image, and gallery on Informacije |
| Goal (one sentence) | Informacije holds optional Opis (saved with name/address) plus optional main image and up-to-6 gallery extras that upload/remove immediately on the public disk, while guest profile and public `salon` stay photoless. |
| Branch name | `story/STORY-69-salon-media-informacije` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-21 |

## Pass/fail — product

- [x] Migration on `salons`: `description` nullable `string(1000)`, `main_image_path` nullable string, `gallery_paths` JSON (default `[]`). No `salon_images` table. `Salon` fillable + casts updated. Factory leaves them empty — verify: Behat (new shop description/main/gallery empty); migration file exists; `git diff` has no `salon_images`
- [x] `scalar Upload` in `schema.graphql`. `UpdateSalonInput.description: String` (optional). Omit → do not change description (existing name/address Behat stays green). Send whitespace/empty → store `null`. Trim non-empty; length > 1000 → `DESCRIPTION_TOO_LONG` and write nothing (name/address unchanged). `updateSalon` still requires name + address — verify: Behat (`features/owner/update_salon.feature` still green; new description scenarios in `features/owner/salon_media.feature`)
- [x] Type `Salon` adds owner-gated `description: String`, `mainImageUrl: String`, `galleryUrls: [String!]!` via `SalonOwnerField` (same `OwnerAccess::salon` as `dnd`). Guest asking any of the three → `UNAUTHENTICATED`. Owner `me.salons` / `salon(id)` returns Opis, relative `/storage/…` main URL or null, ordered gallery URLs. Public `PUBLIC_SALON_QUERY` document unchanged (no those fields) — verify: Behat (guest owner-media query `UNAUTHENTICATED`; owner round-trip); Vitest reading `graphql/salon.ts` has no `description` / `mainImageUrl` / `galleryUrls`
- [x] Mutations (all `OwnerAccess::salon`, return `Salon!` with `id description mainImageUrl galleryUrls`): `uploadSalonMainImage(salonId: ID!, file: Upload!)`, `removeSalonMainImage(salonId: ID!)`, `uploadSalonGalleryImage(salonId: ID!, file: Upload!)`, `removeSalonGalleryImage(salonId: ID!, index: Int!)`. Guest → `UNAUTHENTICATED`. Unverified → `EMAIL_UNVERIFIED`. Foreign/missing salon → `FORBIDDEN` — verify: Behat (`features/owner/salon_media.feature`)
- [x] Public disk only (`Storage::disk('public')`). Paths `salons/{id}/main.{ext}` and `salons/{id}/gallery/{uniq}.{ext}`. Allow MIME `image/jpeg` `image/png` `image/webp` only; max 5 * 1024 * 1024 bytes; check MIME + size **before** store. GIF/SVG/HEIC/`image/gif` → `INVALID_IMAGE_TYPE`, no file. Oversize → `IMAGE_TOO_LARGE`, no file. 7th gallery item → `GALLERY_FULL` before store. Bad index → `INVALID_GALLERY_INDEX`. Replace main deletes the old file. Remove main with no file: success noop. Remove gallery: delete that file, compact JSON, reindex — verify: Behat (tiny jpeg/png/webp ok; gif rejected; 6th ok / 7th `GALLERY_FULL`; replace; remove; index)
- [x] GraphQL URLs are relative `/storage/…` (not absolute `APP_URL`). Vite `server.proxy` adds `/storage` next to `/graphql`. `php artisan storage:link` documented for local; Behat asserts disk path + URL string (does not require HTTP GET) — verify: Vitest reading `vite.config.ts`; Behat URL prefix `/storage/`
- [x] `ME_QUERY` `salons` selects `description mainImageUrl galleryUrls`. `MeData.salons` types match (`description: string \| null`, `mainImageUrl: string \| null`, `galleryUrls: string[]`). `UPDATE_SALON_MUTATION` sends `description` and returns those fields. Four upload/remove operations live next to `UPDATE_SALON_MUTATION` (gql strings used by `graphqlUpload`, not `useMutation`) — verify: Vitest reading `graphql/auth.ts`
- [x] `graphqlUpload()` in `frontend/src/lib/graphqlUpload.ts`: `fetch('/graphql', { method: 'POST', credentials: 'include', body: FormData })` with GraphQL multipart `operations` + `map` + file; CSRF cookie same pattern as `apollo.ts`. No `apollo-upload-client`. `package.json` deps unchanged — verify: Vitest (`graphqlUpload.test.ts` FormData keys; `package.json` no `apollo-upload-client`)
- [x] i18n `bs` only these new keys: `owner.description` `Opis`; `owner.mainImage` `Glavna slika`; `owner.gallery` `Galerija`; `owner.removeImage` `Ukloni`; `owner.addImage` `Dodaj sliku`; `owner.INVALID_IMAGE_TYPE` `Dozvoljeni su JPEG, PNG i WebP.`; `owner.IMAGE_TOO_LARGE` `Slika smije biti do 5 MB.`; `owner.GALLERY_FULL` `Galerija prima najviše 6 slika.`; `owner.DESCRIPTION_TOO_LONG` `Opis smije imati najviše 1000 znakova.` Reuse `owner.save` / `owner.INVALID_NAME` / `owner.INVALID_ADDRESS` / `salon.gate.fallback` — verify: Vitest (`owner.test.ts` `i18n.t`)
- [x] Informacije (`OwnerSalonEdit.tsx`) stays chips + hairline `PANEL`. Field order in the info form: name → address → Opis `textarea` (`FIELD`, 4 rows, `maxLength={1000}`) → Glavna slika → Galerija → Spremi. No fifth chip. Seed Opis in the same `useEffect` as name/address. Spremi calls `updateSalon` with `{ name, address, description }`. Chip switch does not save. `mediaError` under media; `infoError` for Spremi (`DESCRIPTION_TOO_LONG` maps there). Hidden file inputs `accept="image/jpeg,image/png,image/webp"`. Empty main: 40×40 plus (`h-10 w-10`, `aria-label={t('owner.addImage')}`). Set main: 96×96 hairline `<img>` + `Ukloni`. Gallery: same thumbs + Ukloni per item; plus after them unless length is 6. Uploads call `graphqlUpload` then `refetch`. Catalog / create-salon / add-salon pages do not render these fields — verify: Vitest reading `OwnerSalonEdit.tsx` + `OwnerSalons.tsx` / `CreateSalon.tsx` / `OwnerSalonCreate.tsx`; `ownerSalons.source.test.ts` field-order + no fifth chip
- [ ] Informacije media chrome is dense owner Cal (hairline 96px thumbs, plus like catalog, Uredi-like Ukloni, no guest column, no discovery cards) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Laravel Storage public disk, GraphQL multipart, no Spatie), `04-Frontend.md` (Informacije description / main / gallery), `05-Data-Model.md` (`updateSalon` description; owner URLs; public query photoless), `08-Decisions.md` #14 #46, `docs/adr/0037-salon-media-on-informacije.md`, `docs/adr/0032-owner-salon-catalog.md`.

- [x] One React PWA. Lighthouse `/graphql` only; no REST upload route; no Spatie; no sibling `marketing/` — verify: `composer.json` has no spatie; no new `web.php` route; `test ! -d esyres_app/marketing`
- [x] i18next `bs` only. Nine new `owner.*` keys listed above. No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR edits schema / PHP / features → **Behat runs**. Do not change `behat.yml`. Guest `PUBLIC_SALON_QUERY` stays photoless — verify: CONTEXT classifier at verify time; Behat guest salon profile still green

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story adds GraphQL + PHP + Behat + PWA. Expected: classifier **fails** → full Behat set.

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

- Guest UI and public GraphQL for description / main image / gallery (later Epic 1)
- Discovery or catalog photo cards
- Fields on `/create-salon` or `/owner/salons/create`
- Drag-reorder; crop; alt; captions
- GIF / SVG / HEIC; thumbs / WebP transcode / CDN / Spatie
- Service or worker photos
- Coordinates; reschedule cap
- Fifth chip or a setup wizard
- `apollo-upload-client`
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-69.md`, `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `docs/adr/0037-salon-media-on-informacije.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-69-salon-media-informacije` from current `master`.
3. **DB + model:** one migration on `salons` (three columns). Cast `gallery_paths` to array. Default empty gallery.
4. **GraphQL:** `scalar Upload` (Lighthouse built-in). Owner-gated fields on `Salon`. Four mutations + `UpdateSalon` description. Validate MIME with `finfo` / uploaded MIME; 5 MB; gallery count before write. Generate tiny jpeg in Behat via `UploadedFile::fake()->image(...)` (and a gif for reject). Multipart Behat: `operations` + `map` + file, not `postJson`.
5. **PWA:** extend `ME_QUERY` + `MeData`. `graphqlUpload` helper + CSRF. Informacije chrome per Q3. Vite `/storage` proxy. No new npm.
6. **Copy:** nine new keys; assert in `owner.test.ts`. Flip `ownerSalons.source.test.ts` for Opis / media / no fifth chip. Keep `PUBLIC_SALON_QUERY` photoless.
7. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-69.md` Loop to `STORY-69`.
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: **Behat runs**.
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
