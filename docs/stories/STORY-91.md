# STORY-91 — Assign worker

| Field | Value |
|-------|--------|
| ID | STORY-91 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | STORY-91 |
| Depends on | STORY-14, STORY-90 |

## User story

As an owner, I want to confirm a no-preference request that already has a time by tapping a free worker, so that the guest is not asked again.

## Acceptance criteria

- A `requested` booking with a preferred time and no worker shows that salon’s worker names as taps. The taps sit on the Zahtjevi pending card in both Prikaz (Kalendar pile and Kanban **Zahtjevi**) and inside Request Detail. Zapisi cards do not show the taps. The modal does, once opened.
- A listed worker is free for the whole service range at the preferred start. Free means no overlap with a `confirmed` or `time_proposed` booking on that worker, same rule as `acceptPreferredTime`. Hours and breaks are not checked. A past preferred time is allowed. A salon with no free worker shows no taps. **Predloži** and **Odbi** stay.
- A tap calls `assignWorker(bookingId, workerId)`. The row becomes `confirmed` at the guest’s preferred time with that worker. The guest is not asked and the row does not become `time_proposed`. `owner_responded_at` is stamped once, on this first successful action, same as accept. The pending card leaves the queue. If Request Detail is open, the modal stays on the updated card.
- A named-worker **Prihvati** is unchanged. No taps when the preferred time is missing. Slot taken between draw and tap rejects like accept, does not stamp, and leaves the card or modal in place with the existing slot-taken error.
- Already confirmed, not `requested`, another salon, a guest, or an unverified owner is rejected. A failed assign does not stamp `owner_responded_at`.

## Out of scope

- Day-only requests (STORY-92)
- Hours or break checks on assign
- Push, SMS, or email
- Worker logins
- Changing **Predloži**
