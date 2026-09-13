# Add salon requires name and address; public create stays name-only

An owner adds another shop (**add salon**) with both **name and address** required (written location line, not geocode, not `lat`/`lng`). That form is `/owner/salons/create`. This topic does not change `/create-salon`: first shop stays name-only (ADR 0025), already-owner redirect stays. A new shop still starts closed all week with empty services and workers, so it is not listed until salon edit has hours and a service. Guest profile still omits address when missing.

Rejected: reuse `/create-salon` for shop #2; optional address on add salon; requiring coordinates; amending public create in this slice.
