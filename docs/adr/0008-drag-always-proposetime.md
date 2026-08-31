# Drag from the pending queue always calls proposeTime

One-tap Prihvati is the only accept-preferred-time path. Dropping a request onto a panel cell — including the guest’s preferred start on the same named worker — always counter-proposes (`requested → time_proposed`). Mixing `acceptPreferredTime` into drag would skip the customer confirm when the owner “agreed,” but it would make drag mean two different status transitions. Tap/form fallback (sibling) still calls both mutations.
