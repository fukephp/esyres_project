# Frontend

One installable React TypeScript PWA. Not Inertia, not two SPAs.

## Routing

- `/` — customer: discover, salon, request (picker or scripted salon-profile chat), bookings, favorites
- `/bookings?verified=1` — landing after a successful email-verify signed GET (banner on My Bookings). `?verify=invalid` (bad or expired signature) and `?verify=mismatch` (session is a different user). No dedicated `/verify-email` route.
- `/owner` — owner: inbox, worker panel (home), in-flight chat tab, settings, stats; **salon switcher** when the user owns more than one salon

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

- Customers see a day-level busy badge and a simple date+time picker (no slot grid). Scripted salon-profile chat (Epic 10) is an alternate path to the same `createBooking`; it may suggest 1–3 preferred times from busy-level, never live slots. No LLM in v1.
- Copy is Bosnian-first. Prices formatted as BAM via `Intl` (`bs-BA`) from integer feninga.
- Accept-preferred-time and drag-to-counter-propose always have tap/form fallbacks.
- GraphQL errors are machine codes; the SPA maps them to Bosnian strings.
- On `EMAIL_UNVERIFIED`, the picker stays on `/salon/:id` with check-email copy, resend, and a retry of `createBooking`. `/bookings` shows resend when `me.emailVerified` is false. No dedicated verify-email route.
- On `PHONE_UNVERIFIED`, the picker stays on `/salon/:id` with phone + OTP + retry of `createBooking`. `/bookings` shows the same OTP panel when `me.emailVerified` is true and `me.phoneVerified` is false. `me` exposes `phone` (nullable) and `phoneVerified`. No dedicated verify-phone route.

## Discovery

Browser geolocation → `salonsNearby(lat, lng)` sorted list. Permission denied → `popularInSarajevo`. No map SDK. Salon `lat`/`lng` is stored when the salon is provisioned.
