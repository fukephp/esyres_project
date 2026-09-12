# Frontend

One installable React TypeScript PWA. Not Inertia, not two SPAs.

## Routing

- `/` — homepage: shared top-nav (homepage slot), existing hero, simple footer. Pronađi salon goes to `/salons`. Auth does not skip `/` and never auto-jumps to `/owner`. `/salon/:id` never shows the homepage page.
- `/salons` — discovery home (nearby / Popular of listed salons, filter). Top-nav brand links to `/`; slot is Moje rezervacije. Geolocation mounts here.
- `/create-salon` — sparse Design-1 form (AuthShell, email verify, salon name) under an empty top-nav slot. Already-owner redirects to `/owner`.
- Laravel `GET /qr/{salonId}` — counter sticker (not a React route). Records a QR scan (`qr_hits`), sets the hold cookie, and 302s to `/salon/:id`. Never shows the homepage. Vite proxies `/qr` like `/sanctum` so the cookie is on the SPA origin. Instagram-bio and organic `/salon/:id` do not set the cookie or record a scan.
- `/salon/:id` — salon profile (picker + optional assistant). Never the homepage. Top-nav matches `/salons` (Moje rezervacije only).
- `/bookings?verified=1` — landing after a successful email-verify signed GET (banner on My Bookings). `?verify=invalid` (bad or expired signature) and `?verify=mismatch` (session is a different user). No dedicated `/verify-email` route. Top-nav slot: empty when logged out; name + Odjava when logged in.
- `/owner` — owner: inbox, worker panel (home), in-flight chat tab (`/owner/chats`, list + optional Take over / Release + DND toggle), settings, Basic Stats (`/owner/stats`: last-7-day bookings + all-time QR scan/visit/conversion; `?salon=` like chats; nav `Statistika`); **salon switcher** when the user owns more than one salon. Shared top-nav overlays above aside + OwnerNav (name + Odjava).

Owner chunks (including `@dnd-kit`) are lazy-loaded so the customer first paint does not ship the grid.

Customer browse has no login wall. The homepage is not a login wall. Login/register appears in the homepage top-nav slot, at request submit, My Bookings, `/create-salon`, and owner routes. Owner routes overlay the shared top-nav (name + Odjava) above OwnerNav.

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

Typed `/` is the Bosnian homepage (top-nav homepage slot + existing hero + Pronađi salon + simple footer). Pronađi salon goes to `/salons`. No persist-seen. Auth does not skip `/`. `/salon/:id` and `GET /qr/{salonId}` never show it. Shared top-nav is `docs/adr/0029-shared-top-nav.md`. No second Vite app, no `/welcome`, no owner waitlist. See `docs/adr/0027-homepage-not-pitch-gate.md`.

## Discovery

Browser geolocation → `salonsNearby(lat, lng)` sorted list of **listed** salons. Permission denied → `popularInSarajevo` (same listed gate). No map SDK. Nearby requires `lat`/`lng`; self-serve create does not set them. Geolocation runs only after discovery home mounts on `/salons`. See `docs/adr/0028-listed-salon-on-discovery.md`.
