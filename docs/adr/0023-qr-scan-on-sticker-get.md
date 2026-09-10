# A QR scan is recorded on the sticker GET, not only at reconnect

Owner conversion stats need a QR scan count and a QR visit count. Reconnect already appends `qr_scans` (a QR visit). The hold cookie is last-salon-wins and expires, so it is not a scan history. Each successful `GET /qr/{existing salon}` therefore appends an anonymous QR scan (no user). Missing salon and organic `/salon/:id` still write nothing. Rejected: treating `COUNT(qr_scans)` as both numbers (conversion always 100%), and one scan per cookie+salon (a verified repeat GET would then make visits exceed scans).
