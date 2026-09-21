# Story map: STORY-69

> Wayfinder-lite planning artifact. Copy to `.cursor/loops/maps/STORY-xx.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-69 |
| Source | `docs/stories/STORY-69.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-69.md` (after compile) |

## Destination

Informacije on `/owner/salons/:id` holds optional Opis (save with name/address), optional Glavna slika, and optional Galerija (up to 6 extras). Images upload and remove immediately via GraphQL multipart on the public disk. Guest `/salon/:id` and public `salon` stay photoless this slice.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/architecture/03-Backend.md`, `docs/architecture/04-Frontend.md`, `docs/architecture/05-Data-Model.md`, `docs/architecture/08-Decisions.md` #14 #46, `docs/adr/0037-salon-media-on-informacije.md`, `docs/glossary.md` (salon description / main image / gallery), `docs/stories/STORY-69.md`
- Skills: `.cursor/skills/custom-feature-skills/SKILL.md`; grilling rounds; grill-with-docs when terms/ADRs lock
- Code today: Informacije is name + address + `updateSalon`. No `Upload` scalar. Apollo `HttpLink` only. Vite proxies `/graphql` `/sanctum` `/qr`, not `/storage`. `FILESYSTEM_DISK=local` (private); story uses the **public** disk.
- Standing preferences: smallest GraphQL change; Bosnian-first; Design 1 only; no guest display this PR; no new npm unless required
- Fog: first file-upload surface. Round 1 (2026-09-20): Q1–Q3 all A. Round 2: Q4–Q6 all A. Opens empty → compile.

## Decisions so far

- Informacije stays the existing hairline panel (STORY-56 chips; land on Informacije). Field order: name → address → Opis → Glavna slika → Galerija → Spremi. No fifth chip. Same overlay + OwnerNav Saloni. Foreign/missing id stays FORBIDDEN / not found.
- Opis: optional plain text, max 1000, no markdown/HTML. Whitespace-only = empty. Informacije save writes name, address, and description (name/address still required). Chip switch does not save and does not warn; unsaved Opis stays in memory like name/address.
- Main image: one optional jpeg/png/webp, max 5 MB. Not a gallery item. Gallery: up to 6 extras, same types/size; upload order; remove any; no drag-reorder. 7th upload rejected. HEIC, GIF, SVG rejected.
- Images upload/remove immediately (GraphQL multipart, Laravel public disk, no Spatie). Do not wait for Informacije save. Replacing main deletes the old file. Failed type/size keeps no file.
- Public `salon` query document and guest `/salon/:id` stay photoless. Create-salon and add-salon do not collect these fields. Listed still does not require photos. Coords and reschedule cap stay off salon edit.
- `updateSalon` writes optional description (architecture). Images are separate immediate multipart mutations.
- **Q1 A** `description`, `mainImageUrl`, `galleryUrls` on type `Salon`, `SalonOwnerField` (same gate as `dnd`). Select them on `me.salons`. Guest `PUBLIC_SALON_QUERY` unchanged; guest asking those fields → `UNAUTHENTICATED`. No `ownerSalon(id)`.
- **Q2 A** Columns on `salons`: `description` nullable string 1000, `main_image_path`, `gallery_paths` JSON string array. Remove gallery item by 0-based index; delete file; compact list. No `salon_images` table.
- **Q3 A** Opis: `textarea` same `FIELD`, 4 rows, `maxLength={1000}`. Main and each gallery item: 96×96 hairline preview + `Ukloni` (`owner.removeImage`) hairline secondary like Uredi. Empty main: 40×40 plus file control. Gallery add: same plus after previews, hidden at 6. Hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`. No crop, no drag.
- **Q4 A** `scalar Upload`. `UpdateSalonInput.description: String` (optional; omit = no change; client Informacije always sends; trim; whitespace → null). Mutations `uploadSalonMainImage` / `removeSalonMainImage` / `uploadSalonGalleryImage` / `removeSalonGalleryImage(salonId, index: Int!)`; all `OwnerAccess::salon`; return `Salon!`. Public disk paths `salons/{id}/main.{ext}` and `salons/{id}/gallery/{uniq}.{ext}`. GraphQL URLs relative `/storage/…`. Vite proxy `/storage`. `storage:link` for local/Behat file HTTP if needed. MIME+size before store; bad file leaves the row unchanged. Replace main deletes the old file. Remove main with no file is a success noop.
- **Q5 A** Codes `INVALID_IMAGE_TYPE` `IMAGE_TOO_LARGE` `GALLERY_FULL` `DESCRIPTION_TOO_LONG`. Bad index `INVALID_GALLERY_INDEX` → `salon.gate.fallback`. Copy: `owner.description` Opis; `owner.mainImage` Glavna slika; `owner.gallery` Galerija; `owner.removeImage` Ukloni; `owner.addImage` Dodaj sliku. Type `Dozvoljeni su JPEG, PNG i WebP.`; size `Slika smije biti do 5 MB.`; full `Galerija prima najviše 6 slika.`; long `Opis smije imati najviše 1000 znakova.`
- **Q6 A** `graphqlUpload()` helper: `fetch('/graphql', FormData, credentials)` + existing CSRF cookie. `updateSalon` stays `useMutation`. No new npm (`apollo-upload-client` out).
- Image mutation errors use a `mediaError` under the media block (not `infoError`). Success: refetch `Me`. Spremi still `infoError` for name/address/description.

## Open decisions

- (empty)

## Not yet specified

- (empty — fog graduated into opens)

## Out of scope

- Guest UI and public GraphQL for description / main image / gallery (later Epic 1)
- Discovery or catalog photo cards
- Fields on `/create-salon` or `/owner/salons/create`
- Drag-reorder; crop; alt; captions
- GIF / SVG / HEIC; thumbs / WebP / CDN / Spatie
- Service or worker photos
- Coordinates; reschedule cap
- Fifth chip or a setup wizard
