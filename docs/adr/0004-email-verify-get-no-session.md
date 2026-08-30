# Email verify GET does not require a session and does not log in

The signed hash (user id + email) is enough to set `email_verified_at`. Do not auto-login from the link (a leaked mail must not become a session). If a session exists for a different user, reject. Laravel’s default `auth` middleware on `verification.verify` is the rejected alternative: mail apps often open a browser without the PWA cookie.
