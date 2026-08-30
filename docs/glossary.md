# Esyres

Domain language for the Sarajevo salon reservation product. What things **are**, not how they are stored or served.

## People and shops

**Customer**:
A person with email+password who can browse as a guest and send requests once verified. The same person can also be an owner. Not a separate account type and not a worker login.
_Avoid_: account (as a type), member, client user, shopper

**Owner**:
A user who owns at least one salon. The same person can also be a customer. Owners are invite-only; there is no public salon registration.
_Avoid_: merchant, vendor, admin, staff login

**Salon**:
A customer-facing shop with its own profile, hours, services, and workers. One owner may own several salons; each is a separate shop, not a chain location.
_Avoid_: location, branch, store, storefront

**Salon profile**:
The guest-facing page for one salon: name, working hours, services with prices, and busy-level. Not the owner settings screen and not the discovery list.
_Avoid_: storefront, landing, listing detail, shop page

**Worker**:
A named person at a salon who can be requested for a booking. Not a user and not a login. A new salon has none until the owner adds them. Workers inherit the salon’s working hours.
_Avoid_: staff account, employee user, stylist account

**No preference**:
The guest did not pick a specific worker on a request. Valid on its own, not a missing worker and not a fake “any” worker row.
_Avoid_: unassigned, any stylist, empty worker, default worker

## Discovery

**Discovery home**:
The guest `/` list of salons. No login wall. Nearby when the browser has a location; Popular in Sarajevo otherwise. Guests may overlay a discovery filter. Not the salon profile and not a separate search page.
_Avoid_: homepage wall, feed, marketplace index, landing

**Discovery filter**:
An optional overlay on discovery home: one service category and/or a salon-name match. Same nearby-or-popular list, not a separate search page.
_Avoid_: search index, search page, marketplace search, typeahead

**Nearby**:
The discovery list sorted by distance from the guest’s current location. Only salons that have coordinates. Not a map.
_Avoid_: near me map, radius search, geo grid

**Popular in Sarajevo**:
The discovery list when location is denied or unavailable, so `/` is never blank. Not a ranking of bookings or trust badges.
_Avoid_: trending, featured, curated homepage, popular ranking

## Bookings

**My Bookings**:
The customer place that lists their requests by status. Not discovery, not the salon profile, and not the owner queue.
_Avoid_: schedule, inbox (customer), booking history, dashboard

**Request**:
A customer’s booking that is still `requested`: preferred time, one or more services, optional worker. It is not a held clock slot. The owner has not accepted or counter-proposed yet.
_Avoid_: reservation (as confirmed), appointment (as confirmed), order, hold

**Preferred time**:
The guest’s stated calendar day and clock time on a request. Not a reserved slot and not the owner’s counter-proposal.
_Avoid_: slot, availability, booking time (as confirmed), hold

**Service snapshot**:
The name, duration, and KM price copied onto a request at send time. Later catalog edits do not change that request.
_Avoid_: live service row, price lookup

## Catalog

**Service**:
A named offering at one salon: a category (hair, make-up, or massage), a duration, and a KM price. A salon may list services in more than one category. A new salon has none until the owner adds them.
_Avoid_: product, menu item, treatment package, listing

## Time rules

**Working hours**:
The salon’s weekly template: each weekday is closed or open for one local interval. A newly provisioned salon is closed every day until the owner writes hours. Workers inherit this. Not a live slot calendar and not a holiday calendar.
_Avoid_: availability grid, schedule, shifts, opening hours (as a single pair for every day)

**Break**:
An optional lunch-style hole on an open weekday, inside that day’s working hours. At most one per weekday. Distinct from a closed weekday and from a holiday.
_Avoid_: pause, buffer, gap, split shift

**Cancellation notice window**:
How far in advance of a confirmed booking a cancel is on time. Late cancel is a warning, not a block. Set per salon.
_Avoid_: cancellation policy (as a hard block), deposit rule

## Verification

**Verified phone**:
A customer phone that has passed OTP. Required to send a request. Optional at register. Not the login username.
_Avoid_: phone login, SMS login, 2FA, phone username

## Signals

**Busy-level**:
A coarse per-day occupancy for one salon: free, moderate, or busy. Shown to guests instead of a slot grid. Not a Phase 2 trust badge (Fast Responder, Regular, and similar).
_Avoid_: availability, occupancy grid, traffic light, capacity, trust badge
