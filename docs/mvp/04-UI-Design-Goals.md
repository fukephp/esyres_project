# User Interface Design Goals

## 1. Frictionless Funnel First

Every screen on the customer side is designed around a single-tap path: QR code or Instagram bio link → live salon page → request sent. No install step, no login wall before value is shown (browsing is fully guest). Account (email+password, person name at register) and phone OTP appear at request submit / My Bookings, and optionally in the homepage top-nav slot (not a wall). The auth shell says **Rezervacije** (customer) or **Panel** (create-salon / owner) so the door is obvious. Typed `/` is the Bosnian homepage (Design 1 Cal look: top-nav homepage slot + existing hero + Pronađi salon + simple footer); that is not a login wall and never sits in front of `/salon/:id` or the QR sticker. When homepage auth is open, hide hero + footer. Pronađi salon goes to `/salons`. The shared top-nav may appear on salon/discovery with Moje rezervacije only — not Prijava or Get your panel.

On the salon profile, the **primary** button stays the picker (`Pošalji zahtjev`): idle also shows it under the title (plus `Odaberi usluge, dan i vrijeme.`); the lower one stays above chat. All four instances (idle header, idle lower, picker submit, chat submit) share one black pill. Scripted chat is a visible alternate (`Nisi sigurna? Pitaj salon.`), not a second product. Open weekday hours rows (one column) seed the picker’s day. Owners may market the assistant; guests who already know still get a few taps.

## 2. Complexity Belongs on the Owner Side

The customer's entire surface is deliberately narrow: **Profile, Bookmarks/Favorites, Search/Discover, and Schedule/Reschedule.** Scripted chat lives on the salon profile; it is not a customer inbox or dashboard. No dashboards, panels, or stats are ever shown to a customer.

The owner side, by contrast, is where the real scheduling tool lives — the Worker Availability Panel is a dense, actionable table (drag-and-drop, per-worker rows, pending-request queue, occupying cells labeled with the current job) because the owner is the power user managing many customers and workers at once. Home after login is this panel + pending queue. In-flight chat is a **tab with a badge**, not screen 1. Salon catalog (`/owner/salons`) lists shops they own (open now); salon edit is exclusive chips (Informacije / Radno vrijeme / Usluge / Radnici) with one full-width boxed panel. If they own more than one salon, a switcher changes context on queue/chats/stats; each salon stays a separate customer profile.

## 3. Coarse Signals, Not Detailed Schedules (Customer Side)

Customers see a 🟢/🟡/🔴 busy-level badge per day — on the salon profile and on discovery teaser/results — and pick a preferred day and time via a simple picker — not a slot-by-slot availability grid. The assistant uses the same coarse signal: it may suggest 1–3 preferred times from hours, busy-level, and worker preference. It must not name live free slots or hold a clock cell. This keeps both request paths light while letting guests state when they'd like to come; the salon still accepts or counter-proposes.

## 4. Mobile-First, Responsive Second

Primary target is a mobile browser/PWA experience for customers. The owner dashboard is responsive but should still work acceptably from a phone (e.g. accept-preferred-time and drag-to-counter-propose have tap-based fallbacks for exactly this reason).

## 5. Localization as a Trust Signal

Bosnian-first UI and KM-denominated pricing by default, positioned as a differentiator against a foreign-feeling incumbent (Booksy).

## 6. Trust Made Visible (Phase 2 display, MVP-ready data)

Verified (phone + email), Founding Partner, Fast Responder, and similar badges are designed to be shown on salon/customer profiles and possibly inline in search results — this is a Phase 2 UI layer, but the interface should be built so surfacing these later doesn't require rework.

## 7. Calm, Reassuring State Language

States like "Reschedule in progress — thank you for your patience" and late-cancellation warnings (rather than hard blocks) are chosen to keep the customer from feeling penalized or left in limbo while an owner is deciding.

## 8. Salon Voice in Chat (not a named bot)

Guest chat speaks as the salon (Bosnian). No platform character (no “Cora”). Esyres is plumbing. Copy and steps are owned by us (scripted flow); the conversation-shape guideline is acknowledge → short questions → close to a request — not WhatsApp auto-book.

## Decided (visual)

- **Busy badge vs availability panel colors intentionally diverge.** Customer day busy stays 🟢/🟡/🔴; owner cells use distinct free / pending / proposed / booked / off tokens. Status tokens live in Design 1 and are never brand chrome. See `refs/design-1/DESIGN.md`.
- **Guest inner column.** `/`, `/salons`, `/salon/:id`, `/create-salon`, `/bookings` share one ~1200px column (Design 1): top-nav inner and `main` align (same padding, `mx-auto`). Hairline bar stays full-bleed. Lists and headings span; copy/forms/CTAs keep left-aligned local max-widths (not a second centered `max-w-md` page). Discovery stays 1-col. No two-column salon and no right hours rail: open weekday rows are in-column buttons that seed the picker. Exception: `/salon/:id` service list may show a `md+` jump list of service category names (not hours) when the salon has ≥2 visible groups. Owner overlay inner stays unconstrained. Sparse still means no homepage hero/footer on other routes.
- **Salon `Pošalji zahtjev` chrome.** Idle header, idle lower, picker submit, and chat submit are one black pill (Inter 600, 48px min-height, press `#242424` + slight scale). Header idle only gets the support line `Odaberi usluge, dan i vrijeme.` CSS press only — no GSAP, no sticky, no second primary color.
- **Top-nav Odjava.** Cal `button-destructive`: `{colors.error-strong}` `#dc2626` fill, white label, 40px / 8px like Panel. Press `{colors.error-strong-active}` `#b91c1c`. No hover, no confirm. Both logged-in slots (`/` and session). `{colors.error}` stays `#ef4444` for later status text; do not reuse `busy-busy` on this button. Decline/cancel stay as today.

## Not Yet Decided (needs discussion before final design)

- Visual treatment for "no preference" worker requests vs. worker-specific ones, on both sides.
- Whether discovery chips are a fixed set or pulled dynamically from registered salon services. **This slice:** chips stay the three hardcoded Kosa / Šminka / Masaža (legacy key). Owner-named service categories are not chips. See `docs/adr/0033-salon-service-categories.md`.
