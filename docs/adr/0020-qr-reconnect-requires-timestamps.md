# QR reconnect requires real verification timestamps

`hasVerifiedEmail()` / `hasVerifiedPhone()` return true in `APP_ENV=local` with null timestamps so send and owner gates work (ADR 0013). QR reconnect is a trust fact (favorite + QR visit), not a gate. Reconcile only when both `email_verified_at` and `phone_verified_at` are set. Rejected: using the gate helpers (a local login holding `esyres_qr` would fake visits).
