# STORY-86 — Same-day service block

| Field | Value |
|-------|--------|
| ID | STORY-86 |
| Epic | 2 — Booking Request Flow (Customer) |
| Loop | — |
| Depends on | STORY-08, STORY-19, STORY-21, STORY-29 |

## User story

As a customer, I want a second request for a service I already have that day to be refused, so that I cannot spam the same service.

## Acceptance criteria

- A customer cannot send another request at a salon when any chosen service is already on a **different** live booking of theirs at that salon on that preferred day (Sarajevo calendar date). Live means `requested`, `time_proposed`, or `confirmed`. Declined, cancelled, and phone bookings do not count. A different day, a different salon, or a different service still sends. Worker and clock do not matter.
- This is not Zauzet. A `requested` row still does not occupy a quarter. Two customers may both request that service that day.
- Picker and chat: the whole send fails if any selected service hits. Nothing is saved. The overlay stays open. The line is **Već imaš ovu uslugu tog dana.** No service name in the copy.
- Ask other time and reschedule fail the same way on that row in Moje rezervacije when the **target** day already has that service on a different live booking. The same booking may move to a day that is free of that service, including another time on its current day.
- Match the service the guest picked. A later rename of that service still blocks. An older booking counts when its saved name still matches one current service at that salon. A saved name that no longer matches does not.
- Phone booking is unchanged.

## Out of scope

- Disabling the service in the picker or chat before send
- Naming the blocked service in the copy
- Blocking a second customer, a phone booking, or a declined or cancelled row
- Changing Zauzet, occupancy, or the quarter list
