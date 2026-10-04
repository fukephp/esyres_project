# STORY-109 — Unanswered request

| Field | Value |
|-------|--------|
| ID | STORY-109 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-80, STORY-87, STORY-91, STORY-92, STORY-97, STORY-107 |

## User story

As an owner, I want a request I never answered to leave the live boards at the end of its preferred day and show as Nije odgovoreno, so that I cannot approve an old request and I can see that I missed it.

## Acceptance criteria

- A booking still `requested` ages out at midnight at the end of its preferred day, Europe/Sarajevo. A timed request and a day-only request share that moment. `time_proposed`, an in-progress reschedule, a confirmed booking, and a phone booking do not.
- Through that preferred day the owner can still accept, assign a worker, or counter-propose a later quarter, including after the guest’s quarter has passed.
- On that day, while the row is still `requested`, the tag **Ističe danas** shows on the Kalendar pending-pile card, the Kanban **Zahtjevi** card, and Request Detail. A later day has no tag. **Uskoro** stays the occupying tag.
- **Na čekanju · {n}** still counts that row until midnight. After midnight it does not. Reschedule overlays are unchanged, including on past days. Count `0` still hides the button. The jump does not stop on a day whose only rows are **Nije odgovoreno**.
- At midnight the stored status becomes `declined` with reason `expired`. `owner_responded_at` stays empty. Owner boards and Moji zahtjevi show **Nije odgovoreno** at that moment, including when a scheduled flip has not run yet. Accept, assign, decline, and counter-propose fail at that moment. A decline then does not become an owner decline.
- The label is **Nije odgovoreno** on the owner card and the guest row. An owner decline stays **Odbijeno**. The stored reason `expired` is not shown as a sentence.
- After midnight the card sits in Kanban **Završeno i otkazano** for that preferred day, on Zahtjevi and Zapisi. The Kalendar week grid does not show it. On the selected day it sits under the live **Na čekanju** pile (Zahtjevi and Zapisi), outside the till-pile collapse, always visible. Timed rows first, soonest preferred time, then day-only, oldest sent first. The pink count is live pending only. If that count is 0, the section stays: the empty pending line, then these cards. Hiding **Završeno i otkazano** hides the Kanban column only.
- Tap opens Request Detail read-only: the usual meta (name, day, time or **Bez vremena**, services, duration, worker or Bez preferencije) and **Nije odgovoreno**. No Prihvati, worker assign, Odbi, or Predloži. An assistant-originated row keeps **Asistent** and the transcript. An owner decline or a cancel still uses the bounce `Zahtjev više nije na čekanju.`
- The guest sees no **Ističe danas**, no push, no SMS, and no email. At the same midnight the row leaves their **Na čekanju** and reads **Nije odgovoreno**: in **Zadnje odbijeno** when it is the newest declined, otherwise in **Historija**. The newest-booking row on `/my-profile` uses that same label when this booking is that row.
- Statistika is unchanged. Declined rows stay out of the week counts.

## Out of scope

- Aging out a `time_proposed` booking the guest has not answered
- In-progress reschedule and phone bookings
- Push, SMS, or email for this expiry
- Stamping `owner_responded_at`
- A new booking status
- Putting these cards on the week grid
