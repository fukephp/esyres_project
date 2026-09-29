# STORY-82 — Skeleton loading

| Field | Value |
|-------|--------|
| ID | STORY-82 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | `STORY-82` |
| Depends on | STORY-77, STORY-78, STORY-80, STORY-81 |

## User story

As a guest or an owner, I want a page to show the shape of what is coming while it loads, instead of a bare `Učitavanje…` line, so that the screen does not jump and I know where things will land.

## Acceptance criteria

- One shared `Skeleton` component (no library) plus a preset per page. Every `Učitavanje…` (`salon.loading`) paragraph on a page or list becomes a skeleton.
- **Two layers.** Page layer: while a lazy route chunk or the `me` query loads, the frame renders at once with a skeleton of `main`. Section layer: while a list loads, skeleton rows or cards sit where the content will land (Zahtjevi week/day and pending pile, Kanban columns, Zapisi day, Chats, Moje rezervacije, Statistika tiles, discovery results, homepage **Popularno u Sarajevu**, Telefon slot pills).
- **Guest frame:** shared TopNav plus the ~1200px guest column; blocks sized like the page (`/salons` hairline rows; `/salon/:id` name, address, seven weekday rows, service groups; `/bookings` booking cards; `/create-salon` form).
- **Owner frame:** `/owner*` loading renders `OwnerShell` right away, as a ghost. The black sidebar (`md+`) or bottom tab bar (phone) shows pulsing bars in place of the nav links, greeting, and salon switcher; nothing in the ghost is tappable. Once `me` lands, logged-out (AuthShell), unverified, and not-an-owner states still use the guest TopNav (replaces the STORY-78 loading line only).
- Owner presets: Kalendar = seven day columns of card ghosts (phone: day chips + one day) and a pending pile; Kanban = four columns of card ghosts; Zapisi / Chats = rows; Statistika = number tiles; `/owner/salons` = two hairline boxes; salon edit = chip row + one panel; Request Detail = Nazad bar + one **bare** block (loading stays uncarded).
- Homepage Popularno u Sarajevu: four `SalonCard` ghosts while loading; still hidden when the result is empty.
- **Look:** Design 2 tokens only. Fill `surface-card` on `page` / `canvas`, `surface-dark-elevated` on the dark shell. Radius matches the thing it stands in for (`rounded-2xl` cards, `rounded-full` pills, small radius text bars). No pastels, no shadows, no spinners, no fake text, no image placeholders.
- **Motion:** gentle pulse; static under `prefers-reduced-motion`. A skeleton appears only after ~150ms; faster loads show nothing extra.
- **A11y:** the skeleton wrapper is `role="status"` with `aria-busy="true"` and an sr-only `Učitavanje…` (`salon.loading`).
- Unchanged: salon profile keeps the last busy badge until the new day's busy arrives; picker and chat overlays never swap to a loading page; mutation button labels (in-progress text) stay as they are.
- `refs/design-2/DESIGN.md` components table gains a `Skeleton` row.

## Out of scope

- Shimmer, spinners, full-page overlays, optimistic UI, Apollo cache or prefetch changes, backend changes.
