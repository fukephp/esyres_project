# Create salon requires name and address

Self-serve create still lives on `/create-salon` (same account, not a waitlist). ADR 0025’s name-only create is amended: both **name and address** are required (written location line, not geocode, not `lat`/`lng`). A new salon still starts closed all week with empty services and workers, so it is not listed until the owner writes hours and a service on edit. Guest profile still omits address when missing (older shops).

Rejected: keep name-only create; optional address on create; requiring coordinates.
