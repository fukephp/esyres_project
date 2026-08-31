Feature: Guest salon profile
  As a customer
  I want to see a salon's services, prices, hours, and busy-level
  So that I can decide whether to request an appointment

  Scenario: Guest can read public salon profile
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """
    When I query the public salon as a guest
    Then the public salon name is "Kosa Studio"
    And salon hours match:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00", "breakStartsAt": null, "breakEndsAt": null},
        {"weekday": "SUNDAY", "closed": true, "opensAt": null, "closesAt": null, "breakStartsAt": null, "breakEndsAt": null}
      ]
      """
    And salon services match:
      """
      [{"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}]
      """
    And salon workers are empty

  Scenario: Guest can read salon workers
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I query the public salon as a guest
    Then salon workers match:
      """
      [{"name": "Ana"}]
      """

  Scenario: Missing salon is null
    When I query salon "999999" as a guest
    Then the salon is null

  Scenario: Guest cannot read cancellation notice hours
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I query salon owner fields as a guest
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Owner can still read owner fields
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has a worker:
      """
      {"name": "Ana"}
      """
    When I log in as "owner@example.com" with password "secret-pass"
    And I query salon owner fields
    Then cancellation notice hours is 24
    And salon workers match:
      """
      [{"name": "Ana"}]
      """

  Scenario: Busy level is LOW when there are no bookings
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    When I query salon busy level "2026-08-29" as a guest
    Then busy level is "LOW"
