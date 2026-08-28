# Overview & Goals

## The Problem

Booking a haircut, make-up session, or massage in Sarajevo today means calling the salon or DM-ing on Instagram and waiting for a reply. On the other side, salon owners are juggling a phone, a paper notebook, or a group chat, with no clean way to see who's coming in and when.

## The Solution

A two-sided salon reservation marketplace, mobile-first PWA, connecting customers who want frictionless discovery/booking with salon owners who need structured reservation management — launching in Sarajevo, Bosnia and Herzegovina.

## Core Booking Philosophy

The customer picks a service, optionally a worker (or "no preference"), and a preferred **day and time** — no availability grid. Two guest paths, one booking contract: the **picker** is the fast path; a **scripted salon-profile chat** (Salon Booking Assistant) is the messy-intent alternate. Both call the same `createBooking` and create a `requested` row. Chat may suggest 1–3 preferred times from salon hours, day busy-level, and worker preference only — never a live slot grid, never a held clock slot.

The salon owner **accepts** the preferred time in one tap when it works, or **counter-proposes** a different time by dragging the request onto an open slot on the Worker Availability Panel. The customer confirms only when the salon proposes a different time; they can approve, reject, or ask for a different day or time.

Status flow: `requested → confirmed` (owner accepts preferred time) or `requested → time_proposed → confirmed / declined` (owner counter-proposes, then customer acts)

This keeps the customer experience light (state a preference, no slot hunting) while concentrating scheduling authority on the owner side, where it belongs. The assistant’s job is 24/7 intake into that inbox, not auto-confirm.

## Business Goals

- Solve the two-sided cold-start problem in Sarajevo before expanding to Bosnia and Herzegovina more broadly.
- Win trust against Booksy (regional incumbent) through Bosnian-first UI, KM pricing, a genuinely free MVP tier, and founder-led onboarding.
- Preserve the QR-code / Instagram-bio-link → browse → request funnel as the core acquisition mechanic — every product decision is evaluated against whether it protects this path.
- Build a real, usable product for the first 15–20 founder-onboarded salons before thinking about monetization.

## Product Goals

- Replace phone tag and Instagram DM waiting with a structured request-and-propose flow.
- Give owners one shared workspace (Worker Availability Panel) to manage all incoming requests and worker schedules without needing per-worker logins. Owner habit stays this panel; the in-PWA assistant fills it 24/7 so opening the app is worth it.
- Capture the data needed for trust signals (verification, response speed, reliability) from day one, even where the UI to display it is a later phase.

## Explicit Non-Goals (for now)

- Native mobile app (PWA only at MVP; native is a possible fast-follow).
- In-app payments (in-salon payment only).
- Worker self-service logins.
- Reviews/ratings system.
- Viber/WhatsApp / Instagram DM messaging, referral incentives, badge display UI — all Phase 2. In-PWA scripted salon-profile chat is MVP (after the picker/panel loop exists); it is not those channels.

## Note on Architecture

Stack, data model, and Docker live in `docs/architecture/`. These files remain product scope. If a grilled decision changed product behavior (auth, salon switcher, durations, ask-other-day-or-time, preferred time, salon booking assistant), this set was updated to match.
