# Customer respond uses the same email + phone gates as createBooking

Architecture 06 required `email_verified_at` on booking mutations and `phone_verified_at` only on `createBooking`. `myBookings` lists without verify. Confirm / reject / ask-other-time still write booking status (including occupying a slot on confirm), so they use the same session + email + phone gates as `createBooking` (`EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`). Owner mutations stay email-only. The list query is unchanged.
