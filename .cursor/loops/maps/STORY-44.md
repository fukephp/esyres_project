# Story map: STORY-44

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-44 |
| Source | `docs/stories/STORY-44.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-44.md` |

## Destination

Idle `/salons` is a short discovery teaser (first 3 listed Nearby or Popular cards). A category chip, name search, or **Prikaži sve** replaces it with hairline discovery results that show name, today’s busy-level, service categories, and address when set — without a new page, typeahead, or STORY-06 filter change.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/stories/STORY-44.md` (deps STORY-06, STORY-07, STORY-40, STORY-41, STORY-43), `docs/adr/0030-discovery-teaser-then-results.md`, `docs/glossary.md` (**Discovery home**, **Discovery teaser**, **Discovery results**, **Show all**, **Discovery filter**, **Busy-level**), `docs/architecture/04-Frontend.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md` / `refs/design-1/DESIGN.md`
- Skills: grill-with-docs subroutine (app code exists; no diverge); custom-feature-skills; playbook plan-gate until this map compiles
- **STORY-43 is not in the app.** `/salons` still has in-page brand + `BookingsLink`. Shared Cal top-nav is a different PR.
- Code today (`esyres_app/`):
  - `DiscoveryHome` on `/salons`: geo → nearby or popular; three chips; name field (300ms debounce); hairline **name-only** rows; headings `Saloni u blizini` / `Popularno u Sarajevu`; empty keys already split unfiltered vs `Nema rezultata.`
  - Handwritten queries ask `id` + `name` only. `Salon` already has `address`, `services { category }`, `busyLevel(date)`
  - Nearby/Popular do not eager-load services; `serviceList()` is per-salon. Occupancy is per-salon (same as profile). List cap 20 / 50.
  - Profile busy chrome: colored `size-2.5` dot (`busyToken` → `bg-busy-*`) + `salon.busy.LOW|MEDIUM|HIGH` text. Not literal 🟢/🟡/🔴 glyphs.
  - `sarajevoToday()` already used on the profile query. `assistantAddressLine` already omits null/blank address.
  - No icon npm pack. Vitest helpers only (no RTL/Playwright this PR). Behat discovery is GraphQL names + STORY-06 filters.
- Standing preferences:
  - One story → one PR. Do not implement STORY-43 shared top-nav
  - No photos, km, maps, from-price, hours on the row, trust-badge display
  - No URL query params, pagination UI, Popular ranking, typeahead, search-by-service-name
  - No owner address/coords editor, geocoding, dynamic chips
  - Do not change STORY-06 GraphQL filter rules
  - Behat GraphQL-over-HTTP; Vitest helpers; no Playwright, Pest, codegen, extra search/icon npm this PR
  - Bosnian i18n `bs`, informal *ti*

## Decisions so far

- **Idle teaser (story + ADR 0030):** After geo resolves, unfiltered `/salons` is the teaser: same heading (`Saloni u blizini` / `Popularno u Sarajevu`); existing chips; first **3** listed salons from the current nearby-or-popular first page as cards. Geo pending still loading (`salon.loading`).
- **Facts (story):** Cards and rows share name, today’s busy-level (Sarajevo calendar date via existing `sarajevoToday()`, same `LOW|MEDIUM|HIGH` enum as the profile), every service category the salon offers, address only when set. Missing/blank address omits the line. Tap → `/salon/:id`.
- **Counts (story):** 0 listed → existing empty nearby/popular copy; no cards; no show all. 1–3 → that many cards; hide show all. 4+ → 3 cards + `Prikaži sve`.
- **Show all (story):** Not sticky. Replaces the teaser with unfiltered discovery results for **the rest of that first page** (still default 20 / cap 50). No extra back control. Heading never becomes “Rezultati”.
- **Filter (story + STORY-06):** Chip or debounced name (AND unchanged) replaces the teaser with hairline (`divide-hairline`) results, same facts, not cards. Filtered empty stays in results chrome with `Nema rezultata.` Toggle last chip off and clear name → back to the teaser. Search is not a typeahead and not a new page. Name still matches salon name only.
- **Fetch (story “rest of that first page”):** Keep the existing default-20 nearby/popular request. Teaser slices the first 3 of that response; show-all / results render the same page. No `limit: 3` teaser query and no second fetch for show-all.
- **Chrome (STORY-43):** Leave in-page brand + `BookingsLink`. Do not ship shared top-nav in this PR.
- **OOS stays OOS:** photos, km, maps, from-price, hours on the row, trust-badge display, URL params, pagination UI, Popular ranking, typeahead, search-by-service-name, address editor, geocoding, dynamic chips, Awwwards/GSAP, Booksy photo cards, STORY-06 filter rule changes.
- **GraphQL (2026-09-12):** Expand handwritten nearby/popular selection with `address`, `busyLevel(date: $date)` (`$date` = `sarajevoToday()`), `services { category }`. No new `categories` field, no third list query. Eager-load `services` on both list resolvers. Occupancy stays per-salon (same as profile, cap 20).
- **Busy chrome (2026-09-12):** Reuse profile treatment: `busyToken` colored `size-2.5` dot + `salon.busy.*` Bosnian text. No emoji glyphs.
- **Categories (2026-09-12):** Unique set, order `HAIR` → `MAKE_UP` → `MASSAGE` (`DISCOVERY_CATEGORIES`), labels `category.*`. Muted text on card/row, not a second chip row.
- **Search (2026-09-12):** Inline SVG magnifying glass, no new npm pack. `rounded-md`, taller (`py-3`) than today’s `py-2`. Placeholder still `Ime salona`.
- **Cards + show all (2026-09-12):** Teaser cards `bg-surface-card rounded-lg`; `Prikaži sve` text button under the three cards, not a black primary CTA.
- **Verifiers (2026-09-12):** Vitest for view-mode / slice-3 / unique categories / address omit / i18n. Behat one guest scenario that nearby and popular can return address + `busyLevel` + `services.category` (filters unchanged). One human-only: cards vs hairline rows look right at merge. No Playwright/RTL.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Shared Cal top-nav / dropping in-page `BookingsLink` (STORY-43)
- Photos, km, maps, from-price, hours on the row, trust-badge display
- URL query params, pagination UI, Popular ranking, typeahead, search-by-service-name
- Owner address / coords editor, geocoding
- Dynamic category chips (still open in mvp 08)
- Awwwards / GSAP; Booksy/Fresha photo cards
- Changing STORY-06 GraphQL filter rules
- Playwright, Pest, GraphQL codegen, extra search or icon npm pack
