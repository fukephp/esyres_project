# STORY-43 — Shared Cal top-nav

| Field | Value |
|-------|--------|
| ID | STORY-43 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `STORY-43` |
| Depends on | STORY-07, STORY-18, STORY-40, STORY-41, STORY-42 |

## User story

As a guest or owner, I want the same Esyres top-nav on public and owner pages, so that I can always go home and use only the actions that belong on that page.

## Acceptance criteria

- One shared full-bleed top-nav (Cal `top-nav`: canvas, ink, hairline bottom, target 64px). May wrap to a second line on a narrow phone. Not sticky. Mark + wordmark is always a `Link` to `/` (self-link on the homepage). No search, cart, mega-menu, social row, two-row utility bar, country selector, hamburger, or centered catalog nav. See `docs/adr/0029-shared-top-nav.md`.
- `/` slot: guest Prijava / Registracija as nav-link text; Get your panel / Panel as the one black primary button (`ownerPanelCta`). Logged-in: display name + Odjava as nav-link text + that Panel button. AuthShell still opens under the bar (not a login wall). Pronađi salon still works as a guest. Visiting `/` never auto-jumps to `/owner`.
- `/salons` and `/salon/:id` (including after `GET /qr/{id}` 302) share one slot: Moje rezervacije only. No Prijava, Registracija, or Get your panel. Drop the in-page `BookingsLink` once it lives in the bar. Salon name + busy badge stay page content, not the bar.
- `/create-salon` slot is empty. AuthShell, email-verify, and the name form stay in the page. No homepage hero/footer, no OwnerNav, no Get your panel in the bar.
- `/bookings` slot: empty when logged out (AuthShell stays in the page); name + Odjava in the bar when logged in (move Odjava off the page bottom). No Get your panel. No Moje rezervacije self-link.
- `/owner`, `/owner/chats`, `/owner/stats`, `/owner/requests/:id`: overlay — top-nav full-bleed above aside+main. Logged-in name + Odjava; logged-out empty (existing AuthShell in the page). No Moje rezervacije, no Get your panel. Salon switcher, OwnerNav, queue, and 15-minute grid stay.
- `/salon/:id` and `GET /qr/{id}` still never show the homepage (hero + footer + homepage slot). Homepage hero and simple footer stay on `/` only.

## Out of scope

- Sticky top-nav
- Replacing OwnerNav or other owner IA
- Search, cart, mega-menu, or other Poseidon extras
- Moje rezervacije on `/` or `/owner`
- Homepage footer on other routes
- New guest routes
- Public pricing page
- Awwwards / GSAP / Three.js
