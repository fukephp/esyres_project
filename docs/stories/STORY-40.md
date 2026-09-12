# STORY-40 — Homepage on `/`; discovery at `/salons`

| Field | Value |
|-------|--------|
| ID | STORY-40 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-40` |
| Depends on | STORY-05, STORY-10, STORY-39 |

## User story

As a guest who typed `/`, I want a permanent Bosnian homepage with a way into the live salon list, so that `/` is the company page and discovery is its own place.

## Acceptance criteria

- `/` is always the homepage: top-nav with the homepage slot, the existing hero (same Bosnian h1, support, three how-it-works lines, Pronađi salon), and a simple footer. No persist-seen, no `HomeGate` swap, no `companyPitchSeen`. Auth/session does not skip `/`. Visiting `/` never auto-jumps to `/owner`. Shared top-nav on other routes is STORY-43.
- Homepage slot: logo, Prijava / Registracija (reuse `AuthShell`, one account, not two doors), and Have salon? Get your panel as a link to `/create-salon` (the page itself is STORY-41; STORY-43 makes this the black primary in the bar). Logged-in: `User.name` or email + Odjava. Not a login wall — Pronađi salon still works as a guest.
- Pronađi salon navigates to `/salons`. Discovery home (and geolocation) mounts there, not on `/`. Brand/logo links to `/`. `/salon/:id` never shows the homepage page (hero + footer + homepage slot). Putting discovery/salon on the shared top-nav is STORY-43.
- `/salon/:id` and `GET /qr/{id}` never show the homepage.
- Short scroll only (top-nav + hero + footer). Footer is Sarajevo + one Bosnian line. No Terms, Privacy, cookies, Instagram, language toggle, feature grid, product mock, or dark footer. Implementer drafts new Bosnian chrome copy; existing hero strings stay.
- `esyres_app/marketing/` stays gone. No `/welcome`.

## Out of scope

- Implementing `/create-salon` or `createSalon` (STORY-41)
- Changing Get your panel to Panel for existing owners (STORY-41)
- Listed-salon filter (STORY-41)
- Deleting Design-2 / restyling `/owner` (STORY-42)
- Public waitlist, Formspree, `/invite`, `/signup`
- Public pricing page
- Awwwards / GSAP / Three.js
- Geocoding
- Rewriting historical `MKT-*` or STORY-39 acceptance criteria
- Shared top-nav on `/salons`, `/salon/:id`, `/create-salon`, `/bookings`, `/owner` (STORY-43)
