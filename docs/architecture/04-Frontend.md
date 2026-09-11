# Frontend

One installable React TypeScript PWA. Not Inertia, not two SPAs.

## Routing

- `/` — customer **homepage** (homepage-only header, existing hero, simple footer). Discovery home is `/salons` (nearby / Popular, filter). Salon profile, request via picker or scripted salon-profile chat, bookings, favorites stay on their routes. `/salon/:id` never shows homepage chrome. `/login` and `/register` are dedicated auth routes linked from the homepage header.
- Laravel `GET /qr/{salonId}` — counter sticker (not a React route). Records a QR scan (`qr_hits`), sets the hold cookie, and 302s to `/salon/:id`. Never shows the company pitch. Vite proxies `/qr` like `/sanctum` so the cookie is on the SPA origin. Instagram-bio and organic `/salon/:id` do not set the cookie or record a scan.
- `/bookings?verified=1` — landing after a successful email-verify signed GET (banner on My Bookings). `?verify=invalid` (bad or expired signature) and `?verify=mismatch` (session is a different user). No dedicated `/verify-email` route.
- `/owner` — owner: inbox, worker panel (home), in-flight chat tab (`/owner/chats`, list + optional Take over / Release + DND toggle), settings, Basic Stats (`/owner/stats`: last-7-day bookings + all-time QR scan/visit/conversion; `?salon=` like chats; nav `Statistika`); **salon switcher** when the user owns more than one salon

Owner chunks (including `@dnd-kit`) are lazy-loaded so the customer first paint does not ship the grid.

Customer browse has no login wall. The homepage is not a login wall; its header links to `/login` and `/register`. Login/register also appears at request submit, My Bookings, and owner routes.

## Libraries (MVP)

- Vite, React Router, Apollo Client (cookie credentials, cache, owner subscriptions)
- GraphQL Code Generator against local `/graphql`
- Tailwind + CSS variables for busy-level colors
- i18next, default locale `bs`, no language switcher
- `vite-plugin-pwa` + Workbox (shell cache + VAPID push)
- `@dnd-kit` on the owner panel; tap/form fallback calls the same `acceptPreferredTime` and `proposeTime` mutations
- Vitest for small helpers; Playwright for guest → request → accept or counter-propose → confirm

## Explicitly not added

Next.js, Inertia, Redux, Storybook, MUI/Ant, Bootstrap, Leaflet, a REST client, a sibling marketing Vite app.

## UX constraints (from product rules)

- Customers see a day-level busy badge and a simple date+time picker (no slot grid). The picker includes optional worker radios (no preference default). Scripted salon-profile chat (Epic 10) is an alternate path to the same `createBooking` on `/salon/:id` (same-page expand, mutually exclusive with the picker; chat opening interpolates the salon name, optional live address, duration+KM on service chips, and chosen-day hours on the date step; chat offers 1–3 preferred-time suggestions plus optional native other-time; the picker stays native date+time). It must never show live slots. No LLM in v1.
- Copy is Bosnian-first. Prices formatted as BAM via `Intl` (`bs-BA`) from integer feninga.
- Accept-preferred-time and drag-to-counter-propose always have tap/form fallbacks.
- GraphQL errors are machine codes; the SPA maps them to Bosnian strings.
- On `EMAIL_UNVERIFIED`, the picker stays on `/salon/:id` with check-email copy, resend, and a retry of `createBooking`. `/bookings` shows resend when `me.emailVerified` is false. No dedicated verify-email route.
- On `PHONE_UNVERIFIED`, the picker stays on `/salon/:id` with phone + OTP + retry of `createBooking`. `/bookings` shows the same OTP panel when `me.emailVerified` is true and `me.phoneVerified` is false. `me` exposes `phone` (nullable) and `phoneVerified`. No dedicated verify-phone route. Chat on `/salon/:id` uses the same `createBooking` gate panels as the picker (`UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`); already-verified is one submit.
- `/owner` is a lazy pending queue + Worker Availability Panel for one salon-day (login only; Prihvati on named-worker rows via `acceptPreferredTime`; drag onto a free cell calls `proposeTime`; Odbi on every pending row via two-step `declineBooking`; Predloži opens `/owner/requests/:id`). In-progress reschedules appear on the **new** preferred day, tagged `Premještaj`; Prihvati calls `acceptReschedule`; `Zadrži stari` dismisses (original stays); not draggable and no propose/decline. Salon context is `?salon=` when the owner has more than one salon; omit or a bad id → first owned (`id` ASC). `/owner` subscribes to `bookingCustomerResponded`, `bookingRescheduled`, and `bookingCancelled` and refetches queue + occupying; no `pollInterval`. `/owner/chats` is a lazy list of in-flight `AssistantIntake` rows (badge = 24h count, hide at 0); refetch list/count/salon on mount and after Take over / Release / DND; row `Preuzmi` / `Vrati asistentu` when `takeoverAllowed`; pinged rows show `Pitanje`; DND toggle on the tab; no `/owner/chats/:id`, no owner messages, no new subscription. Guest chat on `/salon/:id` refetches `assistantIntake` on mount and window focus; when `takenOver` the chips/send hide and wait copy shows. Chat can say it does not know via `Nešto drugo?` and optionally ping with `Obavijesti salon` (guest does not wait). `/owner/requests/:id` is Request Detail (lazy owner route): form `proposeTime`, Prihvati, Odbi; assistant-originated rows show an `Asistent` chip and a collapsed labeled transcript from the converted intake. Queue rows show the same chip. `/owner/stats` is a lazy Basic Stats screen for the selected salon (`salonStats` last 7 Sarajevo days plus all-time `salonQrStats` scan/visit/percent; `OwnerNav`; `?salon=` same as chats; not home; no `qrScans` list). No `/owner` link on customer pages.
- `/bookings` lists the session customer’s bookings (flat status labels). `TIME_PROPOSED` rows expose confirm / reject / ask-other-time; `CONFIRMED` rows expose reschedule (day+time overlay; original clock stays the main time; in-progress copy while overlay is set) and cancel (two-step; late warning, not a hard block). No `/booking/:id`. Logged-out AuthShell, verify banners, and email/phone panels stay on this route.

## Homepage

Typed `/` is the Bosnian homepage (homepage-only header, existing hero, simple footer). Discovery home is `/salons`; do not persist a “seen” overlay on `/`. `/salon/:id` and `GET /qr/{salonId}` never show homepage chrome. No second Vite app, no `/welcome`. Header login/register are `/login` and `/register`; signed-in chip is email. See `docs/adr/0025-homepage-named-discovery.md`.

## Discovery

Browser geolocation → `salonsNearby(lat, lng)` sorted list. Permission denied → `popularInSarajevo`. Both return **listed** salons only. No map SDK. Salon `lat`/`lng` is set on `createSalon` (and still on founder seed). Geolocation runs only after discovery home mounts (`/salons`, not `/`). See `docs/adr/0027-listed-salons-on-discovery.md`.
