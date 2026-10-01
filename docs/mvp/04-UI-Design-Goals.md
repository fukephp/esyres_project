# User Interface Design Goals

## 1. Frictionless Funnel First

Every screen on the customer side is designed around a single-tap path: QR code or Instagram bio link → live salon page → request sent. No install step, no login wall before value is shown (browsing is fully guest). Account (email+password, person name at register) and phone OTP appear at request submit / My Bookings, and optionally in the homepage top-nav slot (not a wall). The auth shell says **Rezervacije** (customer) or **Panel** (create-salon / owner) so the door is obvious. Typed `/` is the Bosnian homepage (Design 1 Cal look: top-nav homepage slot + existing hero + Pronađi salon + simple footer); that is not a login wall and never sits in front of `/salon/:id` or the QR sticker. When homepage auth is open, hide hero + footer. Pronađi salon goes to `/salons`. The shared top-nav may appear on salon/discovery with Moje rezervacije (plus `Dobrodošli, {person name}` when logged in and named) — not Prijava or Get your panel.

On the salon profile, the **primary** button is the picker (`Pošalji zahtjev`): one black pill after the read-only hours list and before Usluge. That click opens a modal (salon name + muted weekday+date when a date is known). Hours rows are information only. Pitaj salon is not on the profile. `md+` aside is an empty sticky gutter. A logged-out guest signs in inside the modal before the form. Zatvori is the only way out.

## 2. Complexity Belongs on the Owner Side

The customer's entire surface is deliberately narrow: **Profile, Bookmarks/Favorites, Search/Discover, and Schedule/Reschedule.** The salon profile does not offer scripted chat. No dashboards, panels, or stats are ever shown to a customer.

The owner side, by contrast, is where the real scheduling tool lives — **Zahtjevi** is dense and actionable, rendered in the owner's **Prikaz** (chosen in Postavke, stored on the account): **Kalendar** (one week as seven day columns of pastel occupying cards, plus the selected day's pending till-pile) or **Kanban** (the selected day in five status columns: U toku, Zahtjevi, Predloženo, Potvrđeno, Završeno i otkazano; checkboxes on the board can hide U toku and Završeno i otkazano). Zapisi follows the same Prikaz. The owner is the power user managing many customers and workers at once. Home after login is this card. In-flight chat is a **tab with a badge**, hidden until Postavke turns Chat on (default off), not screen 1. Salon catalog (`/owner/salons`) is stacked hairline boxes (name + open now; **Uredi**; plus under the title to add); salon edit is exclusive chips (Informacije / Radno vrijeme / Usluge / Radnici) with one full-width boxed panel; Radno vrijeme is a one-column exclusive accordion (land all collapsed). If they own more than one salon, a switcher changes context on queue/chats/stats; each salon stays a separate customer profile.

## 3. Coarse Signals, Not Detailed Schedules (Customer Side)

Customers see a 🟢/🟡/🔴 busy-level badge per day — on the salon profile and on discovery teaser/results. Pošalji zahtjev offers that day’s quarter starts and disables the ones that are Zauzet. The salon still accepts or counter-proposes.

## 4. Mobile-First, Responsive Second

Primary target is a mobile browser/PWA experience for customers. The owner dashboard is responsive but should still work acceptably from a phone (month stacked above the selected-day list; counter-propose is Request Detail, not drag).

## 5. Localization as a Trust Signal

Bosnian-first UI and KM-denominated pricing by default, positioned as a differentiator against a foreign-feeling incumbent (Booksy).

## 6. Trust Made Visible (Phase 2 display, MVP-ready data)

Verified (phone + email), Founding Partner, Fast Responder, and similar badges are designed to be shown on salon/customer profiles and possibly inline in search results — this is a Phase 2 UI layer, but the interface should be built so surfacing these later doesn't require rework.

## 7. Calm, Reassuring State Language

States like "Reschedule in progress — thank you for your patience" and late-cancellation warnings (rather than hard blocks) are chosen to keep the customer from feeling penalized or left in limbo while an owner is deciding.

## 8. Salon Voice in Chat (not a named bot)

The salon profile does not offer this path (STORY-89). Where the assistant contract still applies, guest chat speaks as the salon (Bosnian). No platform character (no “Cora”). Esyres is plumbing. Copy and steps are owned by us (scripted flow); the conversation-shape guideline is acknowledge → short questions → close to a request — not WhatsApp auto-book.

## Decided (visual)

- **Busy badge vs owner worker-dot colors intentionally diverge.** Customer day busy stays 🟢/🟡/🔴; Zahtjevi month dots are stable per-worker marks on occupying bookings only (not status cells). Design 1 cell tokens stay in the pack but are unused on Zahtjevi home (proposed vs booked is a row tag). Status tokens are never brand chrome. See `refs/design-1/DESIGN.md`.
- **Guest inner column.** `/`, `/salons`, `/salon/:id`, `/create-salon`, `/bookings` share one ~1200px column (Design 1): top-nav inner and `main` align (same padding, `mx-auto`). Hairline bar stays full-bleed. Lists and headings span; copy/forms/CTAs keep left-aligned local max-widths (not a second centered `max-w-md` page). Discovery stays 1-col. `/salon/:id` on a phone stays one column (read-only hours, `Pošalji zahtjev` after the list, then Usluge). `md+` may split hours/services left and an **empty sticky aside** right — not an hours rail, not a second scroll column on a phone, not the owner aside. Hours rows stay in the left column and do not seed a date. Exception: service list may show a `md+` jump list of service category names (not hours) when the salon has ≥2 visible groups; that list stays in the left services block. Owner overlay inner stays unconstrained. Sparse still means no homepage hero/footer on other routes.
- **Salon `Pošalji zahtjev` chrome.** The profile pill and the modal submit are one black pill (Inter 600, 48px min-height, press `#242424` + slight scale). The pill sits after the read-only hours list (left column, not the empty aside) and before Usluge. Picker lives in a native `<dialog>` (phone full-viewport sheet; `md+` centered `max-w-md`; muted weekday+date under the salon name when a date is known). **Zatvori** is a text link and the only dismiss. Backdrop, Escape, the Drugi dan date popup, and send leave it open. CSS press only — no GSAP, no sticky TopNav, no phone dock, no second primary color.
- **Design 2 (supersedes the Cal bullets below where they conflict).** Cream `page` canvas, warm-white `canvas` cards, pastel status fills on owner surfaces (pink requested, blue proposed, yellow confirmed, grey done), black primary pill, Bricolage Grotesque + Manrope. Owner routes share `OwnerShell` (`md+` narrow icon rail, icon bottom tabs on phone, switcher on the greeting row, display greeting); it replaces TopNav + aside + OwnerNav on `/owner*`. Homepage `/` adds Kako radi, Za goste / Za salone, Popularno u Sarajevu, FAQ, and a dark footer (replaces "no feature grid / no dark footer"). See `refs/design-2/DESIGN.md` and `docs/adr/0039-design-2-pack.md`.
- **Zahtjevi Prikaz.** Kalendar: week grid (seven day columns, cards stacked by start, chevrons shift a week; phone = day chips + selected day) plus the selected day's pending till-pile with one-tap accept. Kanban: the selected day in U toku / Zahtjevi / Predloženo / Potvrđeno / Završeno i otkazano columns (checkboxes hide U toku and Završeno i otkazano) (phone = horizontal snap). Confirmed cards in both views show an elapsed-share bar of the occupied range (ink fill, track always visible, Sarajevo clock, once a minute, empty before the start, full at the end). No drag, no now-line. See `docs/adr/0040-owner-view-template.md`. The Cal "Zahtjevi card" bullet below is superseded.
- **Top-nav Odjava.** Design 2 destructive pill: `{colors.error-strong}` `#dc2626` fill, white label, 40px `rounded-full` like Panel. Press `{colors.error-strong-active}` `#b91c1c`. No hover, no confirm. Both logged-in slots (`/` and session). `{colors.error}` stays `#ef4444` for later status text; do not reuse `busy-busy` on this button. Decline/cancel stay as today.
- **Zahtjevi card (superseded by Zahtjevi Prikaz).** `/owner` home is one white `{colors.canvas}` card spanning `main` (`{rounded.lg}` 12px, hairline; no heavy shadow, no grey fill on the box). `md+`: month navigator left, selected-day list right. Phone: navigator stacked above the list. Month chevrons; tap a day to select (Cal ink/primary selected state, not screenshot blue). Month title stays Cal Sans. Occupying-only worker-colored dots (max three). Selected-day list: one clock gutter on the left (existing 2-digit `HH:mm`); pending cards and occupying rows sit to the right. Day heading (weekday, numeric date) is Inter 600 at the current size. Pending till-pile stays soft rounded hairline cards (collapse + count when more than two): gutter is the preferred start, or the reschedule start; meta is duration and worker (or Bez preferencije); initial, tags, and primary CTAs stay. Occupying rows have no box: a hairline under the full row (gutter and content); gutter is the start; meta is `–15:30 · {worker}` (same en-dash, start not repeated); worker dot, current job, Predloženo vrijeme, and the no-show tag stay. Then soon occupying, then the rest, plus titled Pauza / Zatvoreno as muted lines with no clock gutter. No 15-minute board, no drag, no now-line, no `Danas` badge, no ~480px guest widget.
- **Request Detail card.** `/owner/requests/:id` is a modal over Zahtjevi or Zapisi (phone sheet / `md+` card). The card inside is the Cal hairline box. In-card heading is customer name + mode clock. Form, read, and bounce share the card. Zatvori, backdrop, and Escape close it. No Nazad. Not a two-column month|form split and not the sharp salon-edit panel. Owner pills and mutations stay. Loading/auth stay uncarded.

## Not Yet Decided (needs discussion before final design)

- Visual treatment for "no preference" worker requests vs. worker-specific ones, on both sides.
- Whether discovery chips are a fixed set or pulled dynamically from registered salon services. **This slice:** chips stay the three hardcoded Kosa / Šminka / Masaža (legacy key). Owner-named service categories are not chips. See `docs/adr/0033-salon-service-categories.md`.
