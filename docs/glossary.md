# Esyres

Domain language for the Sarajevo salon reservation product. What things **are**, not how they are stored or served.

## People and shops

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

## Discovery

**Discovery home**:
The guest `/` list of salons. No login wall. Nearby when the browser has a location; Popular in Sarajevo otherwise. Not the salon profile and not search.
_Avoid_: homepage wall, feed, marketplace index, landing

**Nearby**:
The discovery list sorted by distance from the guest’s current location. Only salons that have coordinates. Not a map.
_Avoid_: near me map, radius search, geo grid

**Popular in Sarajevo**:
The discovery list when location is denied or unavailable, so `/` is never blank. Not a ranking of bookings or trust badges.
_Avoid_: trending, featured, curated homepage, popular ranking

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

## Signals

**Busy-level**:
A coarse per-day occupancy for one salon: free, moderate, or busy. Shown to guests instead of a slot grid. Not a Phase 2 trust badge (Fast Responder, Regular, and similar).
_Avoid_: availability, occupancy grid, traffic light, capacity, trust badge
