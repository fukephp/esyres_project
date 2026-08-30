# OTP codes in Laravel Cache until Redis is in compose

Architecture names Redis for OTP TTL, but slim Compose still has no redis service (ADR 0001, decision 36). This story stores hashed OTP codes and throttle counters in Laravel Cache (TTL) so Behat can keep `CACHE_STORE=array` and read the last plaintext code from fake `SmsGateway`. Redis stays the intended cache driver when that service lands; this PR does not add it. Decision 9 is not revoked.
