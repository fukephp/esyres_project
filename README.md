# Esyres

Two-sided salon reservation product. Customers request a service for a preferred day; salon owners assign an exact time. Mobile-first PWA.

No application code in this repo yet. Product scope: `docs/mvp/`. Target architecture: `docs/architecture/`. Update this file when features land.

## Capability (MVP)

**Booking model**

- Customer picks service(s), optional worker, and a day — not a clock time.
- Owner proposes a slot from a worker × time-slot panel (drag or form). A proposal holds that slot until confirm/decline/expire.
- Status: `requested` → `time_proposed` → `confirmed` | `declined`.
- Ask for a different day reopens the **same** booking.

**Customer**

- Unauthenticated discovery (geo-sorted list with “Popular in Sarajevo” fallback); search/filter. No map SDK.
- Salon profile: hours, services/prices/durations, day-level busy signal (no time grid).
- Email+password account. Verified email + phone OTP required to send a request. Phone optional at register.
- Approve / reject / ask for another day; bookings list; cancel/reschedule.
- Favorites; QR scan (~7 day guest cookie) bookmarks a visited salon after verify.
- Web push + SMS for status; email reminders.

**Owner**

- Invite-only onboarding. Salon switcher if they own more than one salon.
- Pending request queue; worker availability panel (15-min cells, per-service duration); decline with optional reason.
- Hours, breaks, holidays; cancellation notice window; reschedule cap. Workers inherit salon hours.
- Services, staff, customer history (incl. no-show / QR visit), basic stats.
- Real-time updates (Reverb) and web push for new requests and customer responses.

**Cross-cutting**

- Multi-category salons (hair, make-up, massage).
- Trust metrics captured at MVP (response time, no-show, QR, verification); badge UI later.

**Not in MVP:** native apps, in-app payments, worker logins, reviews, messaging (Viber/WhatsApp), trust badge display, chain multi-location, receptionist roles.

## Docs

- `docs/mvp/` — product scope, users, features, epics, stories
- `docs/architecture/` — locked stack (Laravel/Lighthouse, React PWA, MySQL, Docker). No app folders yet.
