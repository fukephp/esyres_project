Feature: Customer multi-service booking request
  As a customer
  I want to select multiple services in one request
  So that I don't need to submit separate requests for a haircut and a color

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
    And the salon has a service:
      """
      {"name": "Farbanje", "category": "HAIR", "durationMinutes": 45, "priceFeninga": 4000}
      """

  Scenario: Verified customer sends two services in one requested booking
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the booking status is "REQUESTED"
    And the booking has 2 snapshots
    And booking duration minutes is 75
    And booking has no worker
    And booking snapshots match:
      """
      [
        {"name": "Šišanje", "durationMinutes": 30, "priceFeninga": 2500},
        {"name": "Farbanje", "durationMinutes": 45, "priceFeninga": 4000}
      ]
      """

  Scenario: Guest cannot create a booking
    When I create a booking as a guest on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "UNAUTHENTICATED"

  Scenario: Unverified email cannot create a booking
    Given an unverified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "EMAIL_UNVERIFIED"

  Scenario: Unverified phone cannot create a booking
    Given a customer "ana@example.com" with password "secret-pass" whose phone is not verified
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    Then the GraphQL error code is "PHONE_UNVERIFIED"

  Scenario: Empty services are rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with no services
    Then the GraphQL error code is "INVALID_SERVICES"

  Scenario: Duplicate services are rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with duplicate services
    Then the GraphQL error code is "INVALID_SERVICES"

  Scenario: Foreign service is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with a foreign service
    Then the GraphQL error code is "INVALID_SERVICES"

  Scenario: Foreign worker is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with a foreign worker
    Then the GraphQL error code is "INVALID_WORKER"

  Scenario: Closed weekday is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-09-06" at "10:00" with the salon services
    Then the GraphQL error code is "SALON_CLOSED"

  Scenario: Past datetime is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2020-01-06" at "10:00" with the salon services
    Then the GraphQL error code is "PAST_TIME"

  Scenario: Malformed date is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-13-40" at "10:00" with the salon services
    Then the GraphQL error code is "INVALID_DATE"

  Scenario: Malformed time is rejected
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "25:00" with the salon services
    Then the GraphQL error code is "INVALID_TIME"

  Scenario: Preference inside a break on an open day is accepted
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "13:30" with the salon services
    Then the booking status is "REQUESTED"

  Scenario: Preference outside hours on an open day is accepted
    Given a verified customer "ana@example.com" with password "secret-pass"
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "21:00" with the salon services
    Then the booking status is "REQUESTED"

  Scenario: Requested booking counts toward busy-level
    Given a verified customer "ana@example.com" with password "secret-pass"
    And the salon has a service:
      """
      {"name": "Dugi tretman", "category": "HAIR", "durationMinutes": 300, "priceFeninga": 9000}
      """
    When I log in as "ana@example.com" with password "secret-pass"
    And I create a booking on "2026-08-31" at "10:00" with the salon services
    And I query salon busy level "2026-08-31" as a guest
    Then busy level is "MEDIUM"
