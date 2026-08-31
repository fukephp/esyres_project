# Improvements & Open Questions

*This file is split into two parts: (1) product discussion, including items now marked **decided**, and (2) remaining open questions. Architecture locks live in `docs/architecture/`.*

## Part 1 — Things Worth Discussing (my read, not decisions)

### Funnel friction: email verification + phone at request (decided)

Login is email+password so browsing stays open. Phone is optional at register and **required (OTP) to send a request**, with verified email required for request and owner panel. This is the locked trade-off: less than OTP-as-the-only-login, still two gates at submit. Watch verification completion rate once live.

### Two-step approval may slow down perceived responsiveness (worth discussing)

The old model was `requested → confirmed/declined` (one owner action). The current model adds a **fast path** (`requested → confirmed` when owner accepts preferred time), an **owner-decline path** (`requested → declined`), and a **counter-propose path** (`requested → time_proposed → confirmed/declined`). When the owner counter-proposes, the customer must also act — so a request isn't locked in until both parties have acted on that path. The "Fast Responder" trust signal should measure owner response to incoming requests (accept, counter-propose, or decline); "time to fully confirmed" is a separate metric when the counter-propose loop is involved.

### Pricing axis is still genuinely undefined
Per-worker booking used to be the natural Pro-tier gate; it no longer is, since it's core MVP. `MarketingBrainstorm.md` floats Viber/WhatsApp outreach as a candidate paid feature (since it has real per-message cost), which is a reasonable direction, but nothing is locked. This is a business decision, not something I should presume — flagging for your input rather than proposing a number.

### Consider whether "Ask for a different day or time" needs its own light-weight loop now, given it's already core UX
**Decided:** same booking row returns to `requested` with a new preferred day and/or time. Reschedule of a confirmed booking stays Epic 5 (original slot protected).

### Salon Booking Assistant as owner habit / marketing hook (decided)

Not a WhatsApp auto-book product and not an LLM in v1. Esyres stays a two-sided marketplace. The in-PWA scripted assistant is 24/7 intake into the existing `requested` inbox so the Worker Availability Panel is worth opening daily. Scheduling authority stays with the owner.

**Decided:**
- Picker remains the primary salon-profile CTA; chat is the messy-intent alternate. Both call `createBooking`.
- Coarse recommend only (hours + busy-level + worker preference → 1–3 preferred times). No live slots, no hold.
- Same send gates as the picker (login + verified email + phone OTP).
- Owner home stays pending queue + panel. Chat is a tab + badge for in-flight. After send, the object is the booking; transcript on Request Detail.
- Take-over is optional. Guest waits only after owner taps Take over. After hours / DND: take-over off; assistant always finishes. No auto-page on every chat.
- Owner-only; worker login stays Phase 2.
- Knowledge = live salon data only. Unknown → say so; may ping owner; guest does not wait.
- Voice = salon-branded Bosnian; Esyres is plumbing.
- Ships after Epics 2–4 (not in the first demo), still MVP. WhatsApp / Viber / Instagram DM and LLM NLU stay Phase 2 / later.

The YouTube “Claude + WhatsApp” pattern is a conversation-shape guideline (acknowledge, short questions, close to a request) only — not GoHighLevel, not auto-confirm, not per-appointment agency pricing.

## Part 2 — Consolidated Open Questions (from existing docs)

**Pricing & Business**
- What does a future paid tier actually gate, now that per-worker booking is core/free? (Viber/WhatsApp outreach is one candidate, not decided.)

**Booking Flow**
- Auto-expire windows (request-unproposed and proposal-unresponded) are placeholder assumptions — not validated against real usage. Architecture: expire maps to `declined` + reason `expired`.
- Busy-level thresholds (🟢 <50%, 🟡 50–85%, 🔴 >85%) are placeholders.

**Discovery**
- Are category chips on Discovery fixed, or dynamically pulled from registered salon services?
- Does skipping the category step need an explicit affordance?
- Address geocoding: **decided** — founder sets `lat`/`lng` when provisioning the salon.

**Trust & Badges**
- QR unauthenticated hold: **decided** — guest cookie ~7 days, last salon wins, reconcile at verification.
- Does a QR-confirmed visit count toward "Regular" at full weight, or as a lighter secondary signal?
- Do badges ever get revoked/downgraded, or are they permanent once earned?
- Do "Founding Partner"/"Founding Customer" badges have a hard cutoff date or an open threshold?
- Badge display: profile only, or also inline in search/discovery results?

**Phase 2 (parked, but worth remembering)**
- Viber vs. WhatsApp vs. both — no BiH-specific quote obtained yet from either. Assistant v1 is in-PWA only; those channels would reuse the same `createBooking` contract later.
- Whether an LLM later parses messy chat text into the same scripted steps (no free-form answers outside live salon data) — not v1.
- `marketing_consent` field needed before any Phase 2 marketing message — platform-wide or per-salon opt-in not decided.
- Message sender identity for a multi-tenant platform (one platform-level account, salon name via template variables) — directionally clear, not confirmed with a messaging partner.

**Deferred but flagged as high-leverage for a future pass**
- Worker mini-profiles (portfolios, bios, social links)
- Waitlist functionality
- Chain multi-location (shared workers across sites); receptionist/manager roles
- Customer Profile screen (standalone vs. extension of My Bookings/Favorites)
- Lightweight revenue tracking
- Client-side additions: intake/allergy notes, gift cards, group bookings, package deals

---

## How I'd suggest we use this file

Treat Part 1 as things to actively discuss and decide together before those epics are built — not things I've already decided on your behalf. Part 2 is lower-urgency and can mostly stay parked until the relevant epic is actively being built, per the existing "lock decisions explicitly, park open questions explicitly" approach.
