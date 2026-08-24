# User Interface Design Goals

## 1. Frictionless Funnel First

Every screen on the customer side is designed around a single-tap path: QR code or Instagram bio link → live salon page → request sent. No install step, no login wall before value is shown (browsing is fully guest). Account (email+password) and phone OTP appear at request submit / My Bookings, not on the homepage.

## 2. Complexity Belongs on the Owner Side

The customer's entire surface is deliberately narrow: **Profile, Bookmarks/Favorites, Search/Discover, and Schedule/Reschedule.** No dashboards, panels, or stats are ever shown to a customer.

The owner side, by contrast, is where the real scheduling tool lives — the Worker Availability Panel is a dense, actionable table (drag-and-drop, per-worker rows, pending-request queue) because the owner is the power user managing many customers and workers at once. If they own more than one salon, a switcher changes context; each salon stays a separate customer profile.

## 3. Coarse Signals, Not Detailed Schedules (Customer Side)

Customers see a 🟢/🟡/🔴 busy-level badge per day, not a slot-by-slot grid. This keeps the request flow light and avoids putting scheduling decisions on the customer, consistent with the request-and-propose booking model.

## 4. Mobile-First, Responsive Second

Primary target is a mobile browser/PWA experience for customers. The owner dashboard is responsive but should still work acceptably from a phone (e.g. drag-to-propose has a tap-based fallback for exactly this reason).

## 5. Localization as a Trust Signal

Bosnian-first UI and KM-denominated pricing by default, positioned as a differentiator against a foreign-feeling incumbent (Booksy).

## 6. Trust Made Visible (Phase 2 display, MVP-ready data)

Verified (phone + email), Founding Partner, Fast Responder, and similar badges are designed to be shown on salon/customer profiles and possibly inline in search results — this is a Phase 2 UI layer, but the interface should be built so surfacing these later doesn't require rework.

## 7. Calm, Reassuring State Language

States like "Reschedule in progress — thank you for your patience" and late-cancellation warnings (rather than hard blocks) are chosen to keep the customer from feeling penalized or left in limbo while an owner is deciding.

## Not Yet Decided (needs discussion before final design)

- Whether the busy-level badge and Worker Availability Panel visuals should share a consistent color language, or intentionally diverge (customer sees green/yellow/red status; owner sees free/pending/proposed/booked/off cell states) — worth confirming since they represent related but different concepts.
- Visual treatment for "no preference" worker requests vs. worker-specific ones, on both sides.
- Whether category chips on Discovery are a fixed set or pulled dynamically from registered salon services.
