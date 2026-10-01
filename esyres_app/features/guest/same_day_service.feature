Feature: Same-day service block
  As a customer
  I want a second live booking of a service I already have that day to be refused
  So that I cannot send the same service twice

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "WEDNESDAY", "closed": true},
        {"weekday": "THURSDAY", "closed": true},
        {"weekday": "FRIDAY", "closed": true},
        {"weekday": "SATURDAY", "closed": true},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 2500}
      """

  Scenario: A second request for the same service that day is refused and nothing is saved
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And the customer has 1 bookings

  Scenario: Any selected service blocks the whole send
    Given the salon has a service:
      """
      {"name": "Farbanje", "category": "HAIR", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with the salon services
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And the customer has 1 bookings

  Scenario: A different service the same day still sends
    Given the salon has a service:
      """
      {"name": "Farbanje", "category": "HAIR", "durationMinutes": 45, "priceFeninga": 4000}
      """
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Farbanje"
    Then the booking status is "REQUESTED"
    And the customer has 2 bookings

  Scenario: A different day still sends
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-09-01" at "10:00" with service "Šišanje"
    Then the booking status is "REQUESTED"

  Scenario: Another customer can request the same service that day
    Given a verified customer "ana@example.com" with password "secret-pass"
    And another verified customer "lejla@example.com" with password "secret-pass"
    And that other user has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"

  Scenario: The same service at another salon still sends
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And the same owner also owns salon "Drugi"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking at the other salon on "2026-08-31" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"

  Scenario: Worker and clock do not matter
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And that booking is for the salon worker
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the GraphQL error code is "SAME_DAY_SERVICE"

  Scenario: A confirmed booking blocks that day
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the GraphQL error code is "SAME_DAY_SERVICE"

  Scenario: A time proposed booking blocks that day
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And that booking is time proposed
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the GraphQL error code is "SAME_DAY_SERVICE"

  Scenario: A declined booking does not count
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And that booking is declined
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"
    And the customer has 2 bookings

  Scenario: A cancelled booking does not count
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "11:00"
    And that booking is cancelled
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"
    And the customer has 2 bookings

  Scenario: A phone booking does not count
    Given the salon has a worker:
      """
      {"name": "Ana"}
      """
    And the salon has a phone booking on "2026-08-31" at "11:00" for service "Šišanje"
    And a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"

  Scenario: A rename still blocks and a stale snapshot name does not
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with service "Šišanje"
    Then the booking status is "REQUESTED"
    Given the salon service "Šišanje" is renamed to "Fade"
    When I create a booking on "2026-08-31" at "15:00" with service "Fade"
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And the customer has 1 bookings
    Given the customer has a requested booking on "2026-09-01" at "11:00"
    And that booking snapshot is only the name "Staro"
    When I create a booking on "2026-09-01" at "15:00" with service "Fade"
    Then the booking status is "REQUESTED"

  Scenario: Chat send fails the same way and does not attach the intake
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has an in-flight intake
    And the customer has a requested booking on "2026-08-31" at "11:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "15:00" with the salon services and the intake token
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And that intake has no booking
    And the customer has 1 bookings

  Scenario: Ask other time fails on the target day and the same booking may move
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-09-01" at "11:00"
    And the customer has a requested booking on "2026-08-31" at "10:00"
    And that booking is time proposed
    When I log in as "ana@example.com" with password "secret-pass"
    And I ask other time "2026-09-01" at "15:00"
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And that booking preferred date is "2026-08-31"
    And that booking is still "time_proposed"
    When I ask other time "2026-08-31" at "15:00"
    Then ask other time matches:
      """
      {"status": "REQUESTED", "preferredDate": "2026-08-31", "worker": null}
      """

  Scenario: Reschedule fails on the target day and the same booking may move
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-09-01" at "11:00"
    And that booking is confirmed
    And the customer has a requested booking on "2026-08-31" at "10:00"
    And that booking is confirmed
    When I log in as "ana@example.com" with password "secret-pass"
    And I request reschedule "2026-09-01" at "15:00"
    Then the GraphQL error code is "SAME_DAY_SERVICE"
    And that booking preferred date is "2026-08-31"
    And that booking has no reschedule overlay
    When I request reschedule "2026-08-31" at "15:00"
    Then request reschedule matches:
      """
      {"status": "CONFIRMED", "preferredDate": "2026-08-31", "worker": null, "reschedulePending": true, "rescheduleDate": "2026-08-31"}
      """

  Scenario: An in-progress reschedule does not block the overlay day
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the customer has a requested booking on "2026-08-31" at "10:00"
    And that booking is confirmed
    And that booking has a reschedule overlay on "2026-09-01" at "10:00"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-09-01" at "15:00" with service "Šišanje"
    Then the booking status is "REQUESTED"
    When I create a booking on "2026-08-31" at "15:00" with service "Šišanje"
    Then the GraphQL error code is "SAME_DAY_SERVICE"
