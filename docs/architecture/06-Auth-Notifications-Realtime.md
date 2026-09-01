# Auth, notifications, realtime

## Identity

One `users` table. A person can be customer and owner. Owner access = owns at least one salon. Workers are not users.

**Login:** email + password (Sanctum cookie). Guest browse is cookieless aside from the QR hold cookie.

**Email:** verification mail on register. Customer completes verify by clicking the signed link (`verification.verify` GET), not a GraphQL mutation. The GET does not require a session and does not log the user in; a session for a different user is rejected (`/bookings?verify=mismatch`). Bad or expired signature 302s to `/bookings?verify=invalid` (do not distinguish expired vs forged). Success 302s to `/bookings?verified=1`. Never render Laravel 403 Blade for this flow. Sessioned `resendVerificationEmail` re-sends the same mail (cache throttle; `EMAIL_ALREADY_VERIFIED` if already verified). Password login allowed while unverified. Booking mutations and `/owner` require `email_verified_at`. See `docs/adr/0003-email-verify-signed-get.md` and `docs/adr/0004-email-verify-get-no-session.md`.

**Phone:** optional at register; encouraged. **Required (OTP-verified) to `createBooking` and to customer respond** (`confirmProposedTime`, `rejectProposedTime`, `askOtherTime`). `myBookings` does not require it. Stored as canonical E.164, any country (`+` plus 8–15 digits; see `docs/adr/0006-phone-e164-any-country.md`). Verified phone also enables OTP as an alternate login. `phone_verified_at` is captured at MVP; reward-badge **UI** stays Phase 2. See `docs/adr/0011-customer-respond-same-verify-gates.md`.

**Owner onboarding:** invite-only. Salon + first owner are provisioned (or a one-time invite). No public “Register salon.” Customer register is public.

## OTP

Sessioned `requestPhoneOtp(phone)` sends a code; `verifyPhoneOtp(code)` sets `phone_verified_at`. Both return Boolean. Guest → `UNAUTHENTICATED`. Request is allowed while email is still unverified. If `phone_verified_at` is already set, both mutations return `PHONE_ALREADY_VERIFIED` (no number swap this story). Codes in Laravel Cache (TTL, hashed): 6 digits, 5-minute TTL, 1 send/minute per phone and IP, 5 failed verifies then 15-minute cooldown. Redis is the intended cache driver when that service is in compose; slim Compose does not add redis for OTP (see `docs/adr/0005-otp-in-laravel-cache.md`). Wrong/expired/missing code → `INVALID_OTP` (do not distinguish). Send or fail throttle → `TOO_MANY_ATTEMPTS` (do not distinguish). No CAPTCHA at MVP. Fake/log `SmsGateway` locally. SMS is queued, never inline on the mutation (Behat uses sync).

## Session

Same origin. Sanctum cookie, httpOnly, SameSite=Lax, CSRF on mutations. Apollo sends credentials. Bearer tokens deferred to native (Phase 2).

## QR hold

Guest cookie `esyres_qr` (~7 days, httpOnly, SameSite=Lax) stores last scanned `salonId`. At email+phone verification, reconcile: favorite + owner visited + `qr_scans` row; then clear cookie. Last scan wins.

## Realtime

Laravel Reverb + Lighthouse subscriptions on the owner panel (new request, customer response, reschedule). Customer may refetch; owner should not poll.

## Notifications (queued)

- Web push (VAPID) for owner (open or closed tab) and customer status changes
- SMS fallback when push misses (e.g. iOS) for time-critical status
- Email for day-before / hour-before reminders

Push payload includes `salonId`.
