# STORY-05 — Nearby and Popular in Sarajevo

| Field | Value |
|-------|--------|
| ID | STORY-05 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `E1-nearby` |
| Depends on | STORY-01 |

## User story

As a customer, I want to see salons near my current location without logging in, so that I can start browsing immediately from a QR code or IG link. As a customer, I want a fallback list (“Popular in Sarajevo”) when location is denied or unavailable, so that I never hit a blank screen.

## Acceptance criteria

- A guest (no session) can query nearby salons and get only salons with both coordinates, nearest first.
- Salons missing lat or lng are omitted from nearby.
- Invalid lat/lng is rejected.
- A guest can query Popular in Sarajevo (no session) and get all salons in stable id order, including those without coords.
- List paging defaults to 20 and caps at 50; bad page args are rejected.
- Geo grant → nearby query; deny/unavailable → popular query.
- Guest `/` never blanks: nearby heading or Popular heading with a list (possibly empty).

## Out of scope

- Search / filter (STORY-06)
- Request picker (STORY-08)
- Salon Booking Assistant (Epic 10)
- Owner settings UI and owner lat/lng mutation
- Photos, address, geocode UI, maps SDK
- QR hold cookie (STORY-34)
- Real popularity ranking from bookings
- Exposing lat/lng on the public salon type
