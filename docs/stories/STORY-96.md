# STORY-96 — Worker profile on Radnici

| Field | Value |
|-------|--------|
| ID | STORY-96 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-55, STORY-56, STORY-60, STORY-69 |

## User story

As an owner, I want each worker to have a photo, an about text, experience, and lists of talents, specializations, certificates, education, brands, and strongest services, so the salon’s team is described before guests see it.

## Acceptance criteria

- Radnici on `/owner/salons/:id` (STORY-56 chips) becomes a one-column exclusive accordion, like Radno vrijeme (STORY-60). All rows land collapsed. A collapsed row shows the avatar and the worker name. Opening one row closes any other open row. Same owner shell and OwnerNav Saloni. A foreign or missing salon or worker stays forbidden / not found.
- **Add worker** stays name-only (STORY-55 rules: non-empty, unique on the salon). The owner expands the new row to fill in the rest.
- **Profilna slika**: one optional jpeg, png, or webp, max 5 MB. It uploads and removes immediately (GraphQL multipart, Laravel public disk, no Spatie) and does not wait for Spremi. Replacing the photo deletes the old file. A failed type or size check keeps no file. HEIC, GIF, and SVG are rejected (same rules as the salon main image, STORY-69).
- **Initials avatar**: with no photo, the avatar is a pastel circle with initials. Use the first letter of the first word and the first letter of the last word of the name, uppercased (`Joe Doe` → `JD`). A one-word name shows one letter. The avatar follows a rename.
- The expanded row holds, in order: Profilna slika → Ime → **O radniku** → **Godine iskustva** → **Portfolio / Instagram** → **Talenti** → **Specijalizacije** → **Najjače usluge** → **Certifikati** → **Obrazovanje** → **Brendovi i proizvodi** → **Održavanje** → **Spremi**.
- One **Spremi** per expanded worker saves the name and every text and list field together. Name is still required and unique. Every other field is optional. Closing the row or switching chips does not save and does not warn.
- **O radniku**: plain text, max 1000 characters, no markdown or HTML. Whitespace-only counts as empty. Talenti are not repeated inside O radniku.
- **Godine iskustva**: optional whole number from 0 to 60.
- **Portfolio / Instagram**: one optional URL. It must start with `http://` or `https://`.
- **Održavanje**: optional plain text, max 300 characters. It says how often clients come back to keep the look fresh.
- **List fields** (Talenti, Specijalizacije, Certifikati, Obrazovanje, Brendovi i proizvodi): each is free text rows. A `+` button adds an empty row and each row has a remove control. There are no categories. Up to 20 rows per list, each up to 80 characters. Blank or whitespace-only rows are dropped on save. Order is the order entered.
- Placeholder hints guide the owner. Examples: Talenti `npr. šminka, manikir, depilacija`; Specijalizacije `npr. kovrdžava kosa, svadbena šminka`; Brendovi i proizvodi `npr. brendovi koje koristiš tokom i nakon usluge`; Održavanje `npr. osvježenje boje svakih 6 sedmica`.
- **Najjače usluge**: checkboxes over this salon’s services, up to 5 picked. A 6th is refused. They are **display-only**. They do not filter guest worker radios, owner assign, counter-propose, Telefon, availability, or quarter starts. A pick for a service of another salon is refused.
- The owner salon edit query returns every new field (photo URL, text fields, ordered lists, strongest service ids), so the form round-trips after save and reload.
- Public `salon` GraphQL, guest `/salon/:id`, and the Pošalji zahtjev worker radios are unchanged. The avatar shows on Radnici rows only. Zahtjevi, Kanban, Zapisi, Telefon, and Request Detail are unchanged.
- See `docs/adr/0045-worker-profile-on-radnici.md`.

## Out of scope

- Guest display of the worker profile and public GraphQL for it (later Epic 1)
- Booking, assign, or availability filtering by service (a real worker↔service matrix)
- Certificate file uploads; structured certificate or education rows (name, institution, year)
- Avatar on Zahtjevi, Kanban, Telefon, or Request Detail
- Worker login; delete or deactivate; per-worker shifts or vacation
- Drag-reorder of list rows; crop; captions
