# User Interface Design Goals

## 1. Frictionless Funnel First

Every screen on the customer side is designed around a single-tap path: QR code or Instagram bio link → live salon page → request sent. No install step, no login wall before value is shown (browsing is fully guest). Account (email+password) and phone OTP appear at request submit / My Bookings, not on the homepage.

On the salon profile, the **primary** button stays the picker (`Pošalji zahtjev`). Scripted chat is a visible alternate (`Nisi sigurna? Pitaj salon.`), not a second product. Owners may market the assistant; guests who already know still get a few taps.

## 2. Complexity Belongs on the Owner Side

The customer's entire surface is deliberately narrow: **Profile, Bookmarks/Favorites, Search/Discover, and Schedule/Reschedule.** Scripted chat lives on the salon profile; it is not a customer inbox or dashboard. No dashboards, panels, or stats are ever shown to a customer.

The owner side, by contrast, is where the real scheduling tool lives — the Worker Availability Panel is a dense, actionable table (drag-and-drop, per-worker rows, pending-request queue) because the owner is the power user managing many customers and workers at once. Home after login is this panel + pending queue. In-flight chat is a **tab with a badge**, not screen 1. If they own more than one salon, a switcher changes context; each salon stays a separate customer profile.

## 3. Coarse Signals, Not Detailed Schedules (Customer Side)

Customers see a 🟢/🟡/🔴 busy-level badge per day and pick a preferred day and time via a simple picker — not a slot-by-slot availability grid. The assistant uses the same coarse signal: it may suggest 1–3 preferred times from hours, busy-level, and worker preference. It must not name live free slots or hold a clock cell. This keeps both request paths light while letting guests state when they'd like to come; the salon still accepts or counter-proposes.

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

- **Busy badge vs availability panel colors intentionally diverge.** Customer day busy stays 🟢/🟡/🔴; owner cells use distinct free / pending / proposed / booked / off tokens. Status tokens are Design-2-only and are never brand chrome. See `refs/design-2/DESIGN.md`.

## Not Yet Decided (needs discussion before final design)

- Visual treatment for "no preference" worker requests vs. worker-specific ones, on both sides.
- Whether category chips on Discovery are a fixed set or pulled dynamically from registered salon services.
