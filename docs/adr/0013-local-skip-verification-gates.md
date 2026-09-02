# Local skip of email and phone verification gates

`APP_ENV=local` makes `hasVerifiedEmail()` and `hasVerifiedPhone()` return true so logged-in `/bookings`, `/owner`, `createBooking`, customer respond, and owner mutations work without clicking mail or OTP. Timestamp columns stay null. Staging, production, and Behat (`testing`) keep the real gates. Never key off `APP_DEBUG`. Same-DB env flip (local Docker DB later run as staging) is unsupported.

Rejected: Vite/`import.meta.env.DEV` (the SPA can talk to a remote API), auto-stamp on register/login (existing unverified local rows stay stuck; a dumped DB would look verified), and a `SKIP_VERIFICATION` flag (too easy to turn on in staging).
