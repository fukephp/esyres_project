# Target Users

## 1. Customers

People in Sarajevo (and eventually wider BiH) looking to book a haircut, make-up appointment, or massage.

**Current behavior this product replaces:**
- Calling the salon directly
- DMing the salon on Instagram and waiting for a reply, often after hours

**What they want:**
- To see what's roughly available without back-and-forth
- To request an appointment in a few taps, from a QR code or an Instagram bio link, without installing an app or logging in up front
- When intent is messy (wedding Saturday afternoon, not sure which service), to talk to the salon on its profile and still send the same kind of request
- To trust that the salon is legitimate and responsive before committing

**What they explicitly do NOT want (design implication):**
- To deal with a detailed time-slot grid or scheduling logic — that's the salon's job in this model. Chat may suggest 1–3 preferred times from busy-level, not live slots.
- A dashboard-like experience — their surface stays to Profile (including optional scripted chat on that profile), Bookmarks/Favorites, Search/Discover, and Schedule/Reschedule only. Chat speaks as the salon (Bosnian); Esyres is invisible plumbing.

## 2. Salon Owners

Owners of make-up, hairdresser, or massage salons in Sarajevo — solo operators or small teams with a handful of workers/stylists.

**Current behavior this product replaces:**
- A paper notebook, a phone, or a group chat to track bookings
- Manually replying to Instagram DMs and phone calls to arrange times

**What they want:**
- A single, clear inbox of incoming requests (picker and chat both land here as `requested`)
- Control over the exact appointment time (not a fully auto-booked system)
- 24/7 intake so guests are not waiting on Instagram while the owner is with a client — the assistant finishes to a request unless the owner taps Take over
- Simple management of services, prices, working hours, and worker schedules
- A concrete, visible time-saving reason to promote the app to their own customers (guests write, you accept or drag-to-propose)

**Note on scope:** owners are the only side with a real "backend" — dashboard-style complexity (Worker Availability Panel, stats, settings, salon switcher, optional chat tab for in-flight conversations) belongs here, deliberately kept off the customer surface. Home after login is still the pending queue + panel; chat is a tab with a badge, not the default screen. Owner accounts are founder-provisioned (invite-only) at MVP. The assistant does not give workers a login.

## 3. Workers/Stylists (not a login-holding user at MVP)

Every salon has workers, and customers can pick a specific one (or "no preference"). But **workers do not get their own login or app access at MVP** — the owner acts on their behalf from one shared Reservation Inbox / Worker Availability Panel. Worker self-service is a possible future consideration, not part of current scope.

## Out of Scope for Now

- Enterprise/multi-location chains (flagged as a future consideration, not designed yet — see open questions).
- Receptionist/manager roles distinct from the owner (future consideration).
- Customers or salons outside Sarajevo/BiH at launch.
