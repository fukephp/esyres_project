# Auth, notifications, realtime

## Identity

One `users` table. A person can be customer and owner. Owner access = owns at least one salon. Workers are not users.

**Login:** email + password (Sanctum cookie). Guest browse is cookieless aside from the QR hold cookie.

**Email:** verification mail on register. Password login allowed while unverified. Booking mutations and `/owner` require `email_verified_at`.

**Phone:** optional at register; encouraged. **Required (OTP-verified) to `createBooking`.** Verified phone also enables OTP as an alternate login. `phone_verified_at` is captured at MVP; reward-badge **UI** stays Phase 2.

**Owner onboarding:** invite-only. Salon + first owner are provisioned (or a one-time invite). No public “Register salon.” Customer register is public.

## OTP

Codes in Redis (TTL, hashed). Throttle per phone and IP; cooldown after failures. GraphQL errors are generic. No CAPTCHA at MVP. Fake/log `SmsGateway` locally.

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
