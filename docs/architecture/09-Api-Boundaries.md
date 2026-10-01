# API boundaries

The schema and the domain meet at the Eloquent model. A query field loads a row. A mutation loads the model and calls a domain class to change it. A job or broadcast carries the model onward. The GraphQL schema does not dispatch that work and does not declare it.

This does not change decision 8 in `docs/architecture/08-Decisions.md`: one Lighthouse endpoint, PHP contract. Product rules stay in `docs/architecture/03-Backend.md` and `.cursor/rules/backend/booking-lifecycle.mdc`.

## Folder map

Current paths. This standard does not require a new layout. `#import` from `schema.graphql` into more `.graphql` files is allowed.

| Piece | Where it lives |
|---|---|
| Schema | `esyres_app/graphql/schema.graphql`, loaded by `schema_path` in `esyres_app/config/lighthouse.php` |
| Query class, only when a directive cannot express the read | `App\GraphQL\Queries` |
| Mutation class | `App\GraphQL\Mutations` |
| Eloquent model | `App\Models` |
| Domain write | Existing namespaces: `App\Booking`, `App\Trust`, `App\SalonHours`, `App\Push`, `App\Qr`, `App\Discovery`, `App\Stats`, `App\Phone` |
| Job | `App\Jobs` |

Do not add an `App\Components` container or a string locator such as `app('booking')`. Call the domain class directly.

## A query loads a row

A single-record field names the model and lets Lighthouse load it. No query class.

```graphql
salon(id: ID! @eq): Salon @find
```

`@eq` and `@find` are Lighthouse directives. The return type `Salon` is the Eloquent model.

Today `salon(id:)` is `App\GraphQL\Queries\Salon`, and that class only calls `find`. That shape belongs on the schema.

A query class stays when a directive cannot express the read: a list, an auth-scoped read, or a computed field. Nearby, popular, busy level, stats, and the pending queue stay query classes.

## A mutation loads the model, then a domain class writes it

The mutation may authorize and load the model. The transaction and the column write belong to a domain class. The mutation calls that class and returns the model.

Today `acceptPreferredTime` is `App\GraphQL\Mutations\AcceptPreferredTime`. After the owner check and the row load, that class sets `confirmed` inside the resolver. That write belongs beside `App\Booking\WorkerOverlap`. The mutation still returns the `Booking`.

Auth gates stay on the mutation: verified email and phone, salon ownership, and the same `ClientError` codes.

## Side effects stay off the schema

Esyres has no domain events. Do not add an event that nothing fires.

Push, SMS, and broadcasts stay jobs (`App\Jobs`) or the existing `App\Push` and `App\GraphQL\Broadcast*` classes. They carry the model. The schema does not declare them and does not dispatch them.

If an event is added later, it holds the model and a provider maps the event class to a listener. GraphQL still does not dispatch it. There is no `EventServiceProvider` today; the only provider is `App\Providers\AppServiceProvider`.

## No JSON:API

Esyres does not publish a JSON:API. Do not add one for a field the schema already returns.

## Leave alone

- Public GraphQL field names
- Auth gates, integer feninga, and Sarajevo dates
- Behat as the backend gate
- Decision 8 (one Lighthouse endpoint, PHP contract)
