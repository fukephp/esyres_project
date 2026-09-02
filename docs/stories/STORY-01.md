# STORY-01 — Owner hours, breaks, cancel window

| Field | Value |
|-------|--------|
| ID | STORY-01 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `E7-hours-breaks-cancel` |
| Depends on | — |

## User story

As an owner, I want to set my working hours, breaks, and cancellation notice window, so that the system reflects how my salon actually runs.

## Acceptance criteria

- GraphQL login for an existing user starts a Sanctum session cookie. Wrong password fails. No public register and no “register salon.”
- A newly provisioned salon is closed all seven weekdays and has `cancellation_notice_hours` = 24.
- A verified-email owner who owns the salon can replace the weekly template in one mutation: each Mon–Sun day is closed or one opens/closes (Sarajevo local, 15-minute steps, closes exclusive) plus optional one break inside that day’s open interval; they can set `cancellation_notice_hours` and query the salon back.
- Mutation is rejected when: guest or other user; owner email unverified; break on a closed day or outside the open interval; times not on 15-minute steps; overnight (closes ≤ opens).

## Out of scope

- Owner settings UI (`/owner`), React Router, Apollo, i18next, Design 2 chrome
- Public customer salon profile / discovery (Epic 1)
- Worker Availability Panel (Epic 3)
- Services, workers, salon switcher (STORY-02, STORY-03, STORY-04)
- Holiday calendar, reschedule cap
- Public customer register; invite-email onboarding UI
