# Stories

Inventory for what-next and story-loop. **Not** `docs/mvp/07-Stories.md` (narrative only).

One file = one PR. IDs are `STORY-01` … in demo order: Epic **7 → 1 → 2 → 3 → 4 → 10 → 5 → 6 → 8 → 9**. Acceptance criteria live **only** on the story file.

Existing loop maps/keys keep `E*` / `MKT-*` / `SCAFFOLD-*` names until a later rename. Marketing and scaffold keys are not in this inventory.

## File format

Each `STORY-xx.md`:

| Field | Value |
|-------|--------|
| ID | `STORY-xx` |
| Epic | Number and name from `docs/mvp/06-Epics.md` |
| Loop | `.cursor/loops` slug if a map/key exists, else `—` |
| Depends on | Hard deps (`STORY-nn`, …) or `—` |

Then: **User story** (from `docs/mvp/07-Stories.md`), **Acceptance criteria**, **Out of scope**.

## Catalog

| ID | Title | Epic | Loop | Depends on |
|----|--------|------|------|------------|
| STORY-01 | Owner hours, breaks, cancel window | 7 | `E7-hours-breaks-cancel` | — |
| STORY-02 | Owner services and prices | 7 | `E7-services-prices` | STORY-01 |
| STORY-03 | Owner workers | 7 | `E7-workers` | STORY-01 |
| STORY-04 | Salon switcher | 7 | — | STORY-01 |
| STORY-05 | Nearby and Popular in Sarajevo | 1 | `E1-nearby` | STORY-01 |
| STORY-06 | Search and filter | 1 | `E1-search-filter` | STORY-05 |
| STORY-07 | Salon profile | 1 | `E1-salon-profile` | STORY-05, STORY-01, STORY-02 |
| STORY-08 | Multi-service request | 2 | `E2-multi-service` | STORY-07 |
| STORY-09 | Worker pick | 2 | `E2-worker-pick` | STORY-08, STORY-03 |
| STORY-10 | Email and password | 2 | `E2-email-password` | STORY-08 |
| STORY-11 | Email verify | 2 | `E2-email-verify` | STORY-10 |
| STORY-12 | Phone OTP | 2 | `E2-phone-otp` | STORY-10 |
| STORY-13 | Pending queue | 3 | `E3-pending-queue` | STORY-08, STORY-01 |
| STORY-14 | One-tap accept | 3 | `E3-one-tap-accept` | STORY-13, STORY-09 |
| STORY-15 | Drag counter-propose | 3 | `E3-drag-propose` | STORY-13, STORY-03 |
| STORY-16 | Tap fallback | 3 | `E3-tap-fallback` | STORY-15 |
| STORY-17 | Decline request | 3 | `E3-decline` | STORY-13 |
| STORY-18 | My Bookings | 4 | `E4-my-bookings` | STORY-10 |
| STORY-19 | Time proposed respond | 4 | `E4-time-proposed` | STORY-18, STORY-15 |
| STORY-20 | Owner sees customer respond | 4 | — | STORY-19 |
| STORY-21 | Assistant chat on profile | 10 | — | STORY-08, STORY-19 |
| STORY-22 | Assistant time suggestions | 10 | — | STORY-21 |
| STORY-23 | Assistant salon voice and live data | 10 | — | STORY-21 |
| STORY-24 | Assistant send gates | 10 | — | STORY-21, STORY-11, STORY-12 |
| STORY-25 | Assistant requests in queue | 10 | — | STORY-21, STORY-13 |
| STORY-26 | Owner chat tab | 10 | — | STORY-21 |
| STORY-27 | Take over | 10 | — | STORY-26 |
| STORY-28 | Assistant unknown and ping | 10 | — | STORY-21 |
| STORY-29 | Reschedule confirmed | 5 | — | STORY-14 |
| STORY-30 | Cancel with late warning | 5 | — | STORY-18, STORY-01 |
| STORY-31 | Owner push notifications | 6 | — | STORY-13 |
| STORY-32 | Customer SMS fallback | 6 | — | STORY-12, STORY-19 |
| STORY-33 | Reminder email | 6 | — | STORY-11, STORY-14 |
| STORY-34 | QR reconnect | 8 | — | STORY-11 |
| STORY-35 | Trust data capture | 8 | — | STORY-14 |
| STORY-36 | Basic stats | 9 | — | STORY-14 |
| STORY-37 | QR conversion stats | 9 | — | STORY-34 |
