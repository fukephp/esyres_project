# STORY-35 — Trust data capture

| Field | Value |
|-------|--------|
| ID | STORY-35 |
| Epic | 8 — Trust Signal Data Foundations |
| Loop | — |
| Depends on | STORY-14 |

## User story

As the platform, I want to capture response-time and no-show data from day one, so that trust badges can be computed later without a backfill gap.

## Acceptance criteria

- First successful owner accept, counter-propose, or decline stamps `owner_responded_at` once (already required on those actions; this story makes the capture complete for no-show and cancel counters).
- No-show and cancellation counters persist on the customer/salon as events happen.
- Email and phone verification timestamps remain the verification record.
- No badge chips on profiles or discovery (Phase 2).

## Out of scope

- Fast Responder / Regular / Founding badge UI
- Revocation rules (open in mvp 08)
- Changing accept/propose/decline behavior
