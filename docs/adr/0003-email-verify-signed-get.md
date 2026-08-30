# Email verify is a signed GET, not GraphQL

`register` already sends Laravel’s `VerifyEmail` signed URL. Completing verify is that GET (`verification.verify`), then GraphQL (`me` / `createBooking`) — not a `verifyEmail` mutation and not Fortify. Architecture 08’s “one GraphQL endpoint” still holds for product API; this is the mail-click exception the notification already assumed.
