# proposeTime enforces salon hours; acceptPreferredTime does not

The Worker Availability Panel is a clock: droppable cells are that weekday’s open interval minus break. `proposeTime` rejects a range that is not fully inside that inherited window (`OUTSIDE_HOURS`). `acceptPreferredTime` stays overlap-only — the owner’s Prihvati tap is still the assertion, and this PR does not change it. Holidays are not in the app yet and are not checked here.
