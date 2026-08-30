# createBooking gates without OTP UI

First `createBooking` must enforce Sanctum session + `email_verified_at` + `phone_verified_at` (architecture 08 items 5–6). Slim Compose has no Redis yet; there is no register or OTP UI. This PR adds phone columns and fixtures those timestamps in Behat (architecture 03 already allows fixtures when OTP is not under test), plus login-at-submit on the picker. Public register, verify-mail, OTP mutations, Redis, and SMS stay sibling Epic 2 stories. Do not read missing OTP UI as “gates are optional.”
