# STORY-85 — Zahtjevi progress and icon menu

| Field | Value |
|-------|--------|
| ID | STORY-85 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-78, STORY-80, STORY-82, STORY-83 |

## User story

As an owner, I want each confirmed card on Zahtjevi to show how far that appointment has run, and the menu as icons only, so that I can see progress without a wide labeled sidebar.

## Acceptance criteria

- **Where the bar shows.** Zahtjevi only, both Prikaz. Kalendar confirmed cards, Kanban Potvrđeno, and past confirmed cards in Završeno i otkazano. The track is always on those cards. Pending, Predloženo, declined, and cancelled cards have no bar, including grey declined and cancelled cards that share Završeno i otkazano with a past confirmed card. Zapisi, Request Detail, and the homepage Zahtjevi mock have no bar.
- **What the fill is.** Elapsed share of that card’s occupied range (the start and duration the card already uses). Sarajevo clock, same instant as the other owner clocks. Empty at and before the start, full at and after the end. An in-progress reschedule still measures the original occupied range. A no-show stays confirmed and keeps the bar.
- **How it looks and moves.** Ink fill on a soft track at the bottom of the card. No percent text. Width snaps. No animation. While Zahtjevi is open the fill recomputes once a minute. The week grid still has no now-line.
- **Rail.** Every owner route that uses `OwnerShell`. `md+` is a narrow black rail: brand mark linking to `/` (no wordmark), six outline icons, icon Odjava. Order and targets stay today’s (`ownerQueuePath`, `ownerZapisiPath`, `ownerChatPath`, `ownerStatsPath`, `OWNER_SALONS_PATH`, `OWNER_SETTINGS_PATH`), including `?salon=` and `?date=`. Icons: Zahtjevi calendar, Zapisi list, Chats speech bubble, Statistika bar chart, Saloni shop, Postavke gear. Odjava is an exit icon, `error-strong`, accessible name Odjava. Active link is the light pill. Chats keeps the count badge. Tooltips and accessible names are the existing Bosnian labels. No new copy. The rail does not expand.
- **Header.** On `md+`, the salon switcher (more than one salon) or the salon name (one salon) sits on the greeting row, before the action slot (Telefon). Greeting and Telefon stay. Phone header stays: brand, salon name or switcher, Statistika as a text link, text Odjava pill.
- **Phone tabs.** Zahtjevi, Zapisi, Chats (count badge), Saloni, Postavke as the same icons, no visible labels. Accessible names stay the existing labels. Statistika stays off the tab bar.
- **Loading.** The ghost `OwnerShell` uses that same narrow rail and icon tab bar. Placeholders stay untappable until `me` lands.
- Logged-out, unverified, and not-an-owner states keep the guest TopNav.

## Out of scope

- A stored progress field, a percent label, a now-line, drag, or a 15-minute board.
- A rail that expands, a floating dock, or icons on guest TopNav.
- Zapisi, Request Detail, and the homepage mock.
