# Password reset via the Laravel broker

Forgot password lands now with the shared auth box (STORY-98), so a customer or owner who loses a password no longer needs a founder reset. It uses the stock Laravel password broker on the existing `password_reset_tokens` table: link valid 60 minutes, single use, 1 send per minute per email. The mail is a queued notification like the verify mail. The link opens the PWA `/reset-password`, not a Laravel Blade page.

`requestPasswordReset` always answers the same (`Ako račun postoji, poslali smo link.`) so it does not reveal which emails have accounts. A successful reset logs out every session of that user, including the current one when it is the same user, and does not log in. The person signs in again on Prijava with the email filled in. That way a stolen session does not survive a reset.

Rejected: a custom token table, auto-login after reset, keeping other sessions, a reset code by SMS, and Google or social login.
