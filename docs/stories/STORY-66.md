# STORY-66 — Dobrodošli + person name in every top-nav

| Field | Value |
|-------|--------|
| ID | `STORY-66` |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `—` |
| Depends on | STORY-43, STORY-46, STORY-62 |

## User story

As a logged-in guest or owner, I want Dobrodošli and my Ime i prezime in the top-nav on every page, so that I can see I am signed in without opening Moje rezervacije.

## Acceptance criteria

- When trimmed `me.name` is non-empty, the logged-in top-nav shows **`Dobrodošli, {person name}`** (formal/plural, comma, no bang) as text in the existing name-chip spot (span, not a link). Same copy on `/`, `/salons`, `/salon/:id` (including after `GET /qr/{id}` 302), `/create-salon`, `/bookings`, and `/owner*`. Never an email. Never the salon name.
- Empty or whitespace-only name: **no** identity text anywhere (no Dobrodošli, no email chip).
- Guests never see Dobrodošli. Guest `/` stays Prijava / Registracija / Panel. Logged-out `/salons` and `/salon/:id` stay Moje rezervacije only. Logged-out `/create-salon`, `/bookings`, and `/owner*` stay empty (AuthShell in the page).
- `/` with name: greeting → Moje rezervacije → Odjava → Panel. Nameless logged-in `/`: Moje rezervacije → Odjava → Panel. `/bookings` still has no Moje rezervacije self-link. `/owner*` still has no Moje rezervacije.
- `/bookings` and `/owner*` with name: greeting → Odjava (same Cal `button-destructive` as STORY-57). Nameless: Odjava only. No Panel in those slots.
- `/salons` and `/salon/:id` with name: greeting → Moje rezervacije. Nameless: Moje rezervacije only. No Odjava, no Panel, no Prijava / Get your panel.
- `/create-salon` with name: greeting only. Nameless or logged-out: empty. No Odjava, no Panel.
- STORY-66 supersedes STORY-43 / STORY-57 / STORY-62 on the name chip (email fallback, empty create-salon when named, nameless discovery). Chat overlay stays X-only (STORY-63). Bar may still wrap; not sticky.

## Out of scope

- Profile / name edit, gender field, avatar
- Sticky top-nav
- Chat-overlay title or greeting
- Odjava or Panel on discovery or create-salon
- `/welcome` route
- Public pricing page
- GSAP / Awwwards / Three.js
