@booking
Feature: Day-only request
  As a customer
  I want to send a request for an open day with no quarter
  So that the salon can offer a time

  Background:
    Given a verified owner "owner@example.com" with password "secret-pass" owns salon "Kosa Studio"
    And the salon has hours:
      """
      [
        {"weekday": "MONDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00", "breakStartsAt": "13:00", "breakEndsAt": "14:00"},
        {"weekday": "TUESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "WEDNESDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "THURSDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "FRIDAY", "closed": false, "opensAt": "09:00", "closesAt": "20:00"},
        {"weekday": "SATURDAY", "closed": false, "opensAt": "09:00", "closesAt": "17:00"},
        {"weekday": "SUNDAY", "closed": true}
      ]
      """
    And the salon has a service:
      """
      {"name": "Šišanje", "category": "HAIR", "durationMinutes": 300, "priceFeninga": 2500}
      """

  Scenario: Open day with no time is requested and counts as busy
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a day-only booking on "2026-08-31" with the salon services
    Then the booking status is "REQUESTED"
    And the created booking has no preferred start
    And booking duration minutes is 300
    When I query salon busy level "2026-08-31" as a guest
    Then busy level is "MEDIUM"

  Scenario: A chosen time is unchanged
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has a service:
      """
      {"name": "Fade", "category": "HAIR", "durationMinutes": 30, "priceFeninga": 1500}
      """
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with service "Fade"
    Then the booking status is "REQUESTED"
    And the created booking preferred start label is "10:00"

  Scenario: A closed day is still closed
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a day-only booking on "2026-08-30" with the salon services
    Then the GraphQL error code is "SALON_CLOSED"

  Scenario: An intake still requires a time
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I upsert a new assistant intake as a guest
    Then the intake token is a uuid
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a day-only booking on "2026-08-31" with the salon services and the intake token
    Then the GraphQL error code is "INVALID_TIME"
