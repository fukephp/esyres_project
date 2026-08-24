# Improvements & Open Questions

*This file is split into two parts: (1) product discussion, including items now marked **decided**, and (2) remaining open questions. Architecture locks live in `docs/architecture/`.*

## Part 1 — Things Worth Discussing (my read, not decisions)

### Funnel friction: email verification + phone at request (decided)

Login is email+password so browsing stays open. Phone is optional at register and **required (OTP) to send a request**, with verified email required for request and owner panel. This is the locked trade-off: less than OTP-as-the-only-login, still two gates at submit. Watch verification completion rate once live.

### Two-step approval may slow down perceived responsiveness (worth discussing)

The old model was `requested → confirmed/declined` (one owner action). The new model is `requested → time_proposed → confirmed/declined` (owner proposes, then customer must also act). This is a deliberate, reasonable choice given the "salon sets the time" philosophy — but it does mean a customer's request isn't actually locked in until **two** parties have acted, and the "Fast Responder" trust signal now measures only the *owner's* half of that latency, not the whole loop. I don't think this needs to change, but it's worth being explicit that "time to owner proposal" and "time to fully confirmed" are two different metrics worth tracking separately.

### Pricing axis is still genuinely undefined
Per-worker booking used to be the natural Pro-tier gate; it no longer is, since it's core MVP. `MarketingBrainstorm.md` floats Viber/WhatsApp outreach as a candidate paid feature (since it has real per-message cost), which is a reasonable direction, but nothing is locked. This is a business decision, not something I should presume — flagging for your input rather than proposing a number.

### Consider whether "Ask for a different day" needs its own light-weight loop now, given it's already core UX
**Decided:** same booking row returns to `requested` with a new preferred day. Reschedule of a confirmed booking stays Epic 5 (original slot protected).

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
- Viber vs. WhatsApp vs. both — no BiH-specific quote obtained yet from either.
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
