# STORY-69 — Description, main image, and gallery on Informacije

| Field | Value |
|-------|--------|
| ID | STORY-69 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `STORY-69` |
| Depends on | STORY-56 |

## User story

As an owner, I want to add a description, a main image, and a gallery on salon edit Informacije, so that the shop’s catalog copy and photos live on Esyres before guests see them.

## Acceptance criteria

- Informacije on `/owner/salons/:id` stays the existing hairline panel (STORY-56 chips; land on Informacije). Field order: name → address → **Opis** → **Glavna slika** (preview + remove) → **Galerija** (previews + remove + add) → existing save. No fifth chip. Same owner overlay + OwnerNav Saloni. Foreign or missing id stays forbidden / not found.
- **Salon description** (`Opis`): optional plain text, max 1000 characters, no markdown/HTML. Whitespace-only counts as empty. Informacije save writes name, address, and description (name and address still required, cannot blank). Chip switch does not save and does not warn; unsaved Opis stays in memory like name/address (STORY-56).
- **Main image** (`Glavna slika`): one optional jpeg/png/webp, max 5 MB. Not a gallery item. **Gallery** (`Galerija`): up to 6 extra images, same types/size; order is upload order; owner can remove any item; no drag-reorder. A 7th upload is rejected. HEIC, GIF, and SVG are rejected.
- Images upload and remove immediately (GraphQL multipart, Laravel public disk, no Spatie). They do not wait for Informacije save. Replacing main deletes the old file. A failed type or size check keeps no file. Owner edit query returns Opis, main image URL, and ordered gallery URLs so the form round-trips.
- Public `salon` GraphQL is unchanged this story. Guest `/salon/:id`, discovery, and catalog cards stay photoless. Create-salon and add-salon do not collect these fields. Listed still does not require photos. Coords and reschedule cap stay off salon edit.
- See `docs/adr/0037-salon-media-on-informacije.md`.

## Out of scope

- Guest UI and public GraphQL for description / main image / gallery (later Epic 1)
- Discovery or catalog photo cards
- Fields on `/create-salon` or `/owner/salons/create`
- Drag-reorder; crop; alt; captions
- GIF / SVG / HEIC; thumbs / WebP / CDN / Spatie
- Service or worker photos
- Coordinates; reschedule cap
- Fifth chip or a setup wizard
