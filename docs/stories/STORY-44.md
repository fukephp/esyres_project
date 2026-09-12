# STORY-44 — Discovery teaser and richer results

| Field | Value |
|-------|--------|
| ID | STORY-44 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-44` |
| Depends on | STORY-06, STORY-07, STORY-40, STORY-41, STORY-43 |

## User story

As a customer, I want `/salons` to show a short card teaser and then a richer results list when I filter, search, or show all, so that I can pick a salon without opening every profile.

## Acceptance criteria

- After geolocation resolves, idle `/salons` is the **discovery teaser**: heading stays `Saloni u blizini` or `Popularno u Sarajevu`; larger Design 1 search (icon + rounded field, placeholder still `Ime salona`); existing category chips; first **3** listed salons from Nearby or Popular in Sarajevo as cards. See `docs/adr/0030-discovery-teaser-then-results.md`.
- Teaser cards and results rows share the same facts: name, today’s busy-level (Sarajevo date, same 🟢/🟡/🔴 enum as the profile), every service category that salon offers, address only when set. Missing address omits the line. Tap → `/salon/:id`.
- **0 listed** — existing empty nearby/popular copy; no cards; no show all. **1–3 listed** — that many teaser cards; hide show all. **4+ listed** — 3 cards plus Bosnian show all (`Prikaži sve`); it replaces the teaser with unfiltered **discovery results** (the rest of that first page, still default 20 / cap 50).
- A category chip or a name query (existing debounce; STORY-06 AND semantics unchanged) replaces the teaser with filtered discovery results: `divide-hairline` rows, same facts, not cards. Filtered empty stays in results chrome with `Nema rezultata.`
- Toggle the last chip off and clear the name field → back to the teaser. Show all is not sticky. No extra back control. Heading never becomes “Rezultati”.
- Geo pending still shows loading. Search is not a typeahead and not a new page. Name still matches salon name only.

## Out of scope

- Photos, km, maps, from-price, hours on the row, trust-badge display
- URL query params, pagination UI, Popular ranking, typeahead, search-by-service-name
- Owner address / coords editor, geocoding
- Dynamic category chips (still open in mvp 08)
- Awwwards / GSAP; Booksy/Fresha photo cards
- Changing STORY-06 GraphQL filter rules
