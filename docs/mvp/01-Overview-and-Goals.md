# Overview & Goals

## The Problem

Booking a haircut, make-up session, or massage in Sarajevo today means calling the salon or DM-ing on Instagram and waiting for a reply. On the other side, salon owners are juggling a phone, a paper notebook, or a group chat, with no clean way to see who's coming in and when.

## The Solution

A two-sided salon reservation marketplace, mobile-first PWA, connecting customers who want frictionless discovery/booking with salon owners who need structured reservation management — launching in Sarajevo, Bosnia and Herzegovina.

## Core Booking Philosophy

The customer picks a service, optionally a worker (or "no preference"), and a preferred **day**, plus an optional quarter start. On Pošalji zahtjev those starts are the day’s open quarters; one already covered by an occupying booking is Zauzet and cannot be sent. An open day can be sent with no quarter. A closed day cannot. The salon profile shows read-only hours and one `Pošalji zahtjev` that opens the request modal (Danas / Sutra / Drugi dan, then quarter pills). A logged-out guest signs in inside that modal before the form. Scripted salon-profile chat is not offered on the profile. A request calls `createBooking` and creates a `requested` row. The day badge stays coarse.

The salon owner **accepts** a named worker’s preferred time in one tap when it works, **assigns** a free worker when the guest left no preference but did pick a time (that confirms, and the guest is not asked), or **counter-proposes** a different time from Request Detail. The customer confirms only when the salon proposes a different time; they can approve, reject, or ask for a different day or time. A day with no quarter stays pending until that counter-proposal or a decline.

Status flow: `requested → confirmed` (owner accepts preferred time, or assigns a worker on a no-preference request that already has a time), `requested → declined` (owner decline), or `requested → time_proposed → confirmed / declined` (owner counter-proposes, then customer acts). A phone booking is the exception: the owner writes it already `confirmed` for a caller who is not a customer. It occupies a worker immediately. The owner may end it before the start; that becomes `cancelled` with no trust counters.

The picker shows which quarters are already taken. Sending still does not hold a chair; the owner accepts or counter-proposes. Scheduling authority stays on the owner side. The assistant’s job is 24/7 intake into that inbox, not auto-confirm. The phone booking is how the salon records a call without a worker login. Voice capture and an agent that books from those rows are future.

## Business Goals

- Solve the two-sided cold-start problem in Sarajevo before expanding to Bosnia and Herzegovina more broadly.
- Win trust against Booksy (regional incumbent) through Bosnian-first UI, KM pricing, a genuinely free MVP tier, and self-serve create salon on the same account.
- Preserve the QR-code / Instagram-bio-link → browse → request funnel as the core acquisition mechanic — every product decision is evaluated against whether it protects this path. Typed `/` is the homepage; that path never sits in front of `/salon/:id` or the QR sticker.
- Build a real, usable product for Sarajevo salons before thinking about monetization.

## Product Goals

- Replace phone tag and Instagram DM waiting with a structured request-and-propose flow.
- Give owners one shared workspace (Zahtjevi: month navigator + selected-day list) to manage all incoming requests and worker schedules without needing per-worker logins. From that home they can write a phone booking when the caller is not in the app. Owner habit stays this home; the in-PWA assistant fills the pending queue 24/7 so opening the app is worth it.
- Capture the data needed for trust signals (verification, response speed, reliability) from day one, even where the UI to display it is a later phase.
- A guest who typed `/` sees the Bosnian homepage, then Pronađi salon to discovery at `/salons` (teaser, then results) — no separate marketing site.

## Explicit Non-Goals (for now)

- Native mobile app (PWA only at MVP; native is a possible fast-follow).
- In-app payments (in-salon payment only).
- Worker self-service logins.
- Reviews/ratings system.
- Viber/WhatsApp / Instagram DM messaging, referral incentives, badge display UI — all Phase 2. In-PWA scripted salon-profile chat is MVP (after the picker/panel loop exists); it is not those channels.
- A separate marketing Vite app, public owner waitlist / Formspree, public pricing page, and Awwwards/GSAP motion on product screens.

## Note on Architecture

Stack, data model, and Docker live in `docs/architecture/`. These files remain product scope. If a grilled decision changed product behavior (auth, salon switcher, durations, ask-other-day-or-time, preferred time, salon booking assistant, homepage on `/`), this set was updated to match.
