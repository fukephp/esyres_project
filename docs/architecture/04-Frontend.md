# Frontend

One installable React TypeScript PWA. Not Inertia, not two SPAs.

## Routing

- `/` — customer: discover, salon, request, bookings, favorites
- `/owner` — owner: inbox, worker panel, settings, stats; **salon switcher** when the user owns more than one salon

Owner chunks (including `@dnd-kit`) are lazy-loaded so the customer first paint does not ship the grid.

Customer browse has no login wall. Login/register appears at request submit, My Bookings, and owner routes.

## Libraries (MVP)

- Vite, React Router, Apollo Client (cookie credentials, cache, owner subscriptions)
- GraphQL Code Generator against local `/graphql`
- Tailwind + CSS variables for busy-level colors
- i18next, default locale `bs`, no language switcher
- `vite-plugin-pwa` + Workbox (shell cache + VAPID push)
- `@dnd-kit` on the owner panel; tap/form fallback calls the same `acceptPreferredTime` and `proposeTime` mutations
- Vitest for small helpers; Playwright for guest → request → accept or counter-propose → confirm

## Explicitly not added

Next.js, Redux, Storybook, MUI/Ant, Bootstrap, Leaflet, a REST client.

## UX constraints (from product rules)

- Customers see a day-level busy badge and a simple date+time picker (no slot grid).
- Copy is Bosnian-first. Prices formatted as BAM via `Intl` (`bs-BA`) from integer feninga.
- Accept-preferred-time and drag-to-counter-propose always have tap/form fallbacks.
- GraphQL errors are machine codes; the SPA maps them to Bosnian strings.

## Discovery

Browser geolocation → `salonsNearby(lat, lng)` sorted list. Permission denied → `popularInSarajevo`. No map SDK. Salon `lat`/`lng` is stored when the salon is provisioned.
