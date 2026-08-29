# MySQL in slim Compose for Behat

Slim Compose was `php` + `node` only (sqlite in `.env.example` / phpunit). Architecture still names MySQL as source of truth and Behat a dedicated test DB. For Epic 7 hours we add a **mysql** service now so Behat hits MySQL, not sqlite. nginx, redis, reverb, vite, and mailpit stay off this compose until a later PR. Decision 26’s full list remains the target.
