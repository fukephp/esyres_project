# STORY-78 — Owner shell

| Field | Value |
|-------|--------|
| ID | STORY-78 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-77, STORY-50, STORY-71 |

## User story

As an owner, I want one clear navigation (a sidebar on a laptop, bottom tabs on a phone) instead of a top bar, an aside, and a repeated menu, so that I can find Zahtjevi, Zapisi, Chats, and Postavke at a glance.

## Acceptance criteria

- Every `/owner*` page that has a signed-in, verified owner with a salon renders inside `OwnerShell`. TopNav and OwnerNav are no longer rendered on those pages.
- `md+`: fixed black sidebar (brand mark → `/`, salon switcher when they own more than one salon, otherwise the salon name; links Zahtjevi, Zapisi, Chats with the in-flight badge, Statistika, Saloni, Postavke; active link is a light pill; Odjava at the bottom as the destructive button).
- Phone: compact header (brand, salon name or switcher, Odjava) and a fixed black bottom tab bar with Zahtjevi, Zapisi, Chats (badge), Saloni, Postavke. Statistika stays reachable from the header link. Content keeps bottom padding so the bar does not cover it.
- Header shows `Dobrodošli, {person name}` as the display heading when the person has a name; otherwise the page title. An optional action slot (Telefon on Zahtjevi).
- Links keep today's targets and `?salon=` / `?date=` rules (`ownerQueuePath`, `ownerZapisiPath`, `ownerChatPath`, `ownerStatsPath`, `OWNER_SALONS_PATH`, `OWNER_SETTINGS_PATH`).
- Loading, logged-out (AuthShell), unverified, and not-an-owner states keep the guest TopNav. (Loading superseded by STORY-82: ghost `OwnerShell`.)

## Out of scope

- Prikaz and the Zahtjevi/Zapisi layouts (STORY-79, STORY-80).
