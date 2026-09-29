# UX audit — September 2026 (pre Design 2)

Not product or architecture truth. Input to [`refs/design-2/DESIGN.md`](../../refs/design-2/DESIGN.md) and STORY-77..81.

**Method:** browser walk of `/` at 1280px (screenshot below), plus a code walk of every `/owner*` page (`OwnerHome`, `OwnerZapisi`, `OwnerChats`, `OwnerStats`, `OwnerRequestDetail`, `OwnerSalons`, `OwnerSalonCreate`, `OwnerSalonEdit`, `OwnerSettings`), `TopNav`, `OwnerNav`, and `index.css`. The live owner walk was blocked locally: `localhost` resolved to another project on `::1`, so owner routes stayed on `Učitavanje…` through `127.0.0.1`.

**Reference direction:** [Intelly HealthCare dashboard (Dribbble)](https://dribbble.com/shots/23902200-Intelly-HealthCare-App-Dashboard): cream canvas, black left sidebar, pastel status cards, big display greeting, week board.

## Pain points (owner-reported)

1. Looks empty / flat / not premium.
2. Owner navigation is hard to scan.
3. Owner cannot see the week at a glance.
4. Phone layout feels cramped or long-scroll.

## Findings

| Area | Flaw | Pain |
|------|------|------|
| Homepage `/` | One H1, one support line, a numbered list, one CTA, two-line footer. No proof, no owner pitch, no live salons, no visual. Most of a 1280px viewport is white. | 1 |
| Homepage `/` | "Imaš salon? Otvori panel" is the only owner door; there is no "why Esyres for salons". | 1 |
| Owner chrome | Three navigation layers stacked: TopNav (brand, greeting, Odjava), a 224px white aside (switcher + OwnerNav), and on phone the same OwnerNav repeated inside `main` under the H1. Every owner page duplicates this block (switcher + OwnerNav in aside **and** in `md:hidden`). | 2, 4 |
| Owner chrome | Active nav item is only `font-semibold`; idle is `text-body`. No icons, no active surface — weak scan. | 2 |
| Owner chrome | Salon switcher is a raw `<select>` repeated per page. | 2 |
| Zahtjevi | Month navigator + one selected day. Owner must tap day by day to understand a week. Month dots only mark occupying workers (max three), not load. | 3 |
| Zahtjevi | Pipeline state is invisible: how many pending vs proposed vs confirmed is not shown anywhere. | 3 |
| Zahtjevi | Every row is the same hairline + ink. Status is a tiny bordered tag (`Predloženo vrijeme`), so proposed vs confirmed look alike. | 1, 3 |
| Zahtjevi phone | Month grid (six rows) sits above the list, so the first pending card is below the fold. | 4 |
| Zapisi | Flat day list with status as trailing text (`· Potvrđeno`). No grouping, no color. | 1, 3 |
| Visual system | White canvas, gray hairlines, one black accent. Status tokens exist (`cell-*`) but are unused on owner home. Nothing carries color meaning. | 1 |
| Guest salon/discovery | Structure is sound (day-gated send, busy badge). Visual rhythm is weak: sections separated only by hairlines on white. | 1 |

## What to keep

- Guest funnel: QR / bio → `/salon/:id` → pick open day → `Pošalji zahtjev` → picker modal → `requested`. One tap where possible.
- One-tap accept on pending; counter-propose from Request Detail only; no drag.
- Telefon modal on Zahtjevi; `?salon=` on queue, chats, stats, Zapisi.
- Busy badge 🟢/🟡/🔴 for guests; worker dots for owners.

## Direction (locked in grilling, 2026-09-29)

- New **Design 2** pack replaces Design 1 Cal (cream canvas, black owner sidebar, pastel cards, Bricolage Grotesque + Manrope).
- Owner picks **Prikaz**: Kalendar (week grid) or Kanban (status board) in Postavke, stored on the account. Drives Zahtjevi and Zapisi.
- Homepage gets split hero, Kako radi, Za goste / Za salone, Popularno u Sarajevu, FAQ, richer footer.
