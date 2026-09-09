Feature: Owner assistant-originated pending requests
  As an owner
  I want chat-sent requests in the same pending queue, with intake on the row
  So I can accept or counter-propose without a second inbox

  Background:
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

  Scenario: Chat createBooking appears in the queue with intake
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has an in-flight intake
    And that intake prefers "2026-08-31" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services and the intake token
    Then the booking status is "REQUESTED"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-31"
    Then this pending booking intake prefers "2026-08-31" at "10:00"
    When I query the owner booking
    Then the owner booking intake prefers "2026-08-31" at "10:00"

  Scenario: Picker createBooking has no intake
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    When I log in as "owner@example.com" with password "secret-pass"
    And I query pending bookings for date "2026-08-31"
    Then this pending booking intake is null
    When I query the owner booking
    Then the owner booking intake is null
