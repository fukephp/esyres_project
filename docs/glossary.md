# Esyres

Domain language for the Sarajevo salon reservation product. What things **are**, not how they are stored or served.

## People and shops

**Owner**:
A user who owns at least one salon. The same person can also be a customer. Owners are invite-only; there is no public salon registration.
_Avoid_: merchant, vendor, admin, staff login

**Salon**:
A customer-facing shop with its own profile, hours, and workers. One owner may own several salons; each is a separate shop, not a chain location.
_Avoid_: location, branch, store, storefront

**Worker**:
A named person at a salon who can be requested for a booking. Not a user and not a login.
_Avoid_: staff account, employee user, stylist account

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
